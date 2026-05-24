import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student } from './student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(@InjectModel(Student.name) private studentModel: Model<Student>) {}

  async create(dto: CreateStudentDto, schoolId: string) {
    const existing = await this.studentModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const student = new this.studentModel({
      ...dto,
      password: hashedPassword,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      classId: new mongoose.Types.ObjectId(dto.classId),
    });
    
    await student.save();
    return this.findOne(student._id.toString(), schoolId);
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    const [data, total] = await Promise.all([
      this.studentModel.find(query).select('-password').populate('classId', 'name').skip(skip).limit(limit).exec(),
      this.studentModel.countDocuments(query).exec()
    ]);
    return { data, total, page };
  }

  async findOne(id: string, schoolId: string) {
    const student = await this.studentModel.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).select('-password').populate('classId', 'name').exec();
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: string, dto: UpdateStudentDto, schoolId: string) {
    const updateData: Record<string, unknown> = { ...dto };

    const student = await this.studentModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
      updateData,
      { new: true },
    ).select('-password').exec();
    
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async remove(id: string, schoolId: string) {
    const student = await this.studentModel.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).select('-password').exec();
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }
}