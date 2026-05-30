import { Injectable, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Student } from './student.schema';
import { User } from '../user/user.schema';
import { Enrollment } from '../enrollment/enrollment.schema';
import { AcademicYear } from '../academic-year/academic-year.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { withTransaction } from '../../common/utils/with-transaction.util';

@Injectable()
export class StudentService {
  private readonly useTransactions: boolean;
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    @InjectModel(AcademicYear.name) private academicYearModel: Model<AcademicYear>,
    private configService: ConfigService,
  ) {
    this.useTransactions = this.configService.get<boolean>('USE_TRANSACTIONS', false);
  }

  private handleError(error: any): never {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }
    if (error.code === 11000) {
      throw new ConflictException('Duplicate entry — a record with this value already exists');
    }
    this.logger.error(error.message, error.stack);
    throw new InternalServerErrorException('An unexpected error occurred');
  }

  async create(dto: CreateStudentDto & { academicYearId?: string }, schoolId: string) {
    try {
      // Retrieve active academic year if not provided
      let academicYearId = dto.academicYearId;
      if (!academicYearId) {
        const activeYear = await this.academicYearModel.findOne({
          schoolId: new mongoose.Types.ObjectId(schoolId),
          isActive: true,
        });
        if (!activeYear) {
          throw new ConflictException('No active academic year found for this school. Please activate one first.');
        }
        academicYearId = activeYear._id.toString();
      }

      let student: any = null;
      let enrollment: any = null;

      const db = this.studentModel.db;

      await withTransaction(
        db,
        this.useTransactions,
        async (session) => {
          const options = session ? { session } : {};

          const createdStudentArray = await this.studentModel.create([{
            name: dto.name,
            rollNumber: dto.rollNumber,
            phone: dto.phone,
            gender: dto.gender,
            schoolId: new mongoose.Types.ObjectId(schoolId),
          }], options);
          student = createdStudentArray[0];

          const createdEnrollmentArray = await this.enrollmentModel.create([{
            studentId: student._id,
            classId: new mongoose.Types.ObjectId(dto.classId),
            academicYearId: new mongoose.Types.ObjectId(academicYearId),
            schoolId: new mongoose.Types.ObjectId(schoolId),
            isActive: true,
          }], options);
          enrollment = createdEnrollmentArray[0];
        },
        async () => {
          // Manual cleanup in reverse order
          if (enrollment) {
            await this.enrollmentModel.findByIdAndDelete(enrollment._id).exec();
          }
          if (student) {
            await this.studentModel.findByIdAndDelete(student._id).exec();
          }
        }
      );

      return this.findOne(student._id.toString(), schoolId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
      const [students, total] = await Promise.all([
        this.studentModel.find(query).skip(skip).limit(limit).exec(),
        this.studentModel.countDocuments(query).exec()
      ]);

      const data = await Promise.all(students.map(async (student) => {
        const enrollment = await this.enrollmentModel.findOne({
          studentId: student._id,
          isActive: true
        }).populate('classId', 'name').exec();
        const user = await this.userModel.findOne({ profileId: student._id, profileModel: 'Student' }).exec();
        return {
          ...student.toObject(),
          classId: enrollment?.classId || null,
          email: user?.email || '',
        };
      }));

      return { data, total, page };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string, schoolId: string) {
    try {
      const student = await this.studentModel.findOne({ 
        _id: new mongoose.Types.ObjectId(id), 
        schoolId: new mongoose.Types.ObjectId(schoolId) 
      }).exec();
      if (!student) throw new NotFoundException('Student not found');

      const enrollment = await this.enrollmentModel.findOne({
        studentId: student._id,
        isActive: true
      }).populate('classId', 'name').exec();

      const user = await this.userModel.findOne({ profileId: student._id, profileModel: 'Student' }).exec();

      return {
        ...student.toObject(),
        classId: enrollment?.classId || null,
        email: user?.email || '',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, dto: UpdateStudentDto, schoolId: string) {
    try {
      const updateData: Record<string, unknown> = { ...dto };

      const student = await this.studentModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
        updateData,
        { new: true },
      ).exec();
      
      if (!student) throw new NotFoundException('Student not found');
      return this.findOne(student._id.toString(), schoolId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, schoolId: string) {
    try {
      const student = await this.studentModel.findOneAndDelete({ 
        _id: new mongoose.Types.ObjectId(id), 
        schoolId: new mongoose.Types.ObjectId(schoolId) 
      }).exec();
      if (!student) throw new NotFoundException('Student not found');

      // Cascading Deletions: delete User account and student enrollments
      await this.userModel.findOneAndDelete({
        profileId: student._id,
        profileModel: 'Student',
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();

      await this.enrollmentModel.deleteMany({
        studentId: student._id,
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();

      return student;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createLogin(id: string, dto: any, schoolId: string) {
    try {
      const student = await this.studentModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();
      if (!student) throw new NotFoundException('Student not found');

      const existingUser = await this.userModel.findOne({
        profileId: student._id,
        profileModel: 'Student'
      }).exec();
      if (existingUser) {
        throw new ConflictException('Login already exists for this student');
      }

      const existingEmail = await this.userModel.findOne({
        email: dto.email,
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();
      if (existingEmail) {
        throw new ConflictException('Email already in use for this school');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      await this.userModel.create([{
        email: dto.email,
        password: hashedPassword,
        role: 'Student',
        schoolId: new mongoose.Types.ObjectId(schoolId),
        profileId: student._id,
        profileModel: 'Student',
      }]);

      return { message: 'Login created successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }
}