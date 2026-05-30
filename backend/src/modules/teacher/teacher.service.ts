import { Injectable, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Teacher } from './teacher.schema';
import { User } from '../user/user.schema';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ValidationService } from '../shared/validation.service';
import { withTransaction } from '../../common/utils/with-transaction.util';

@Injectable()
export class TeacherService {
  private readonly useTransactions: boolean;
  private readonly logger = new Logger(TeacherService.name);

  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(User.name) private userModel: Model<User>,
    private validationService: ValidationService,
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

  async create(dto: CreateTeacherDto, schoolId: string) {
    try {
      if (dto.classIds && dto.classIds.length > 0) {
        for (const id of dto.classIds) {
          await this.validationService.validateClass(id, schoolId);
        }
      }
      if (dto.subjectIds && dto.subjectIds.length > 0) {
        for (const id of dto.subjectIds) {
          await this.validationService.validateSubject(id, schoolId);
        }
      }

      let teacher: any = null;
      const db = this.teacherModel.db;

      await withTransaction(
        db,
        this.useTransactions,
        async (session) => {
          const options = session ? { session } : {};

          const createdTeacherArray = await this.teacherModel.create([{
            name: dto.name,
            phone: dto.phone,
            gender: dto.gender,
            schoolId: new mongoose.Types.ObjectId(schoolId),
            classIds: dto.classIds?.map(id => new mongoose.Types.ObjectId(id)) || [],
            subjectIds: dto.subjectIds?.map(id => new mongoose.Types.ObjectId(id)) || [],
          }], options);
          teacher = createdTeacherArray[0];
        },
        async () => {
          if (teacher) {
            await this.teacherModel.findByIdAndDelete(teacher._id).exec();
          }
        }
      );

      return this.findOne(teacher._id.toString(), schoolId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
      const [teachers, total] = await Promise.all([
        this.teacherModel.find(query).skip(skip).limit(limit).exec(),
        this.teacherModel.countDocuments(query).exec()
      ]);

      const data = await Promise.all(teachers.map(async (teacher) => {
        const user = await this.userModel.findOne({ profileId: teacher._id, profileModel: 'Teacher' }).exec();
        return {
          ...teacher.toObject(),
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
      const teacher = await this.teacherModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();
      if (!teacher) throw new NotFoundException('Teacher not found');

      const user = await this.userModel.findOne({ profileId: teacher._id, profileModel: 'Teacher' }).exec();
      return {
        ...teacher.toObject(),
        email: user?.email || '',
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findMe(id: string, schoolId: string) {
    try {
      return this.findOne(id, schoolId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, dto: UpdateTeacherDto, schoolId: string) {
    try {
      const updateData: Record<string, unknown> = { ...dto };
      if (dto.classIds) {
        for (const cid of dto.classIds) {
          await this.validationService.validateClass(cid, schoolId);
        }
        updateData.classIds = dto.classIds.map(cid => new mongoose.Types.ObjectId(cid));
      }
      if (dto.subjectIds) {
        for (const sid of dto.subjectIds) {
          await this.validationService.validateSubject(sid, schoolId);
        }
        updateData.subjectIds = dto.subjectIds.map(sid => new mongoose.Types.ObjectId(sid));
      }

      const teacher = await this.teacherModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
        updateData,
        { new: true },
      ).exec();

      if (!teacher) throw new NotFoundException('Teacher not found');
      return this.findOne(teacher._id.toString(), schoolId);
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, schoolId: string) {
    try {
      const teacher = await this.teacherModel.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();
      if (!teacher) throw new NotFoundException('Teacher not found');

      // delete corresponding login
      await this.userModel.findOneAndDelete({
        profileId: teacher._id,
        profileModel: 'Teacher',
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();

      return teacher;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createLogin(id: string, dto: any, schoolId: string) {
    try {
      const teacher = await this.teacherModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();
      if (!teacher) throw new NotFoundException('Teacher not found');

      const existingUser = await this.userModel.findOne({
        profileId: teacher._id,
        profileModel: 'Teacher'
      }).exec();
      if (existingUser) {
        throw new ConflictException('Login already exists for this teacher');
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
        role: 'Teacher',
        schoolId: new mongoose.Types.ObjectId(schoolId),
        profileId: teacher._id,
        profileModel: 'Teacher',
      }]);

      return { message: 'Login created successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }
}