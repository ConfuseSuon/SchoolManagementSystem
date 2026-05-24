import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Teacher } from './teacher.schema';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ValidationService } from '../shared/validation.service';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    private validationService: ValidationService,
  ) { }

  async create(dto: CreateTeacherDto, schoolId: string) {
    const existing = await this.teacherModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already in use');

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

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const teacher = new this.teacherModel({
      ...dto,
      password: hashedPassword,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      classIds: dto.classIds?.map(id => new mongoose.Types.ObjectId(id)) || [],
      subjectIds: dto.subjectIds?.map(id => new mongoose.Types.ObjectId(id)) || [],
    });

    await teacher.save();
    return this.findOne(teacher._id.toString(), schoolId);
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    const [data, total] = await Promise.all([
      this.teacherModel.find(query).select('-password').skip(skip).limit(limit).exec(),
      this.teacherModel.countDocuments(query).exec()
    ]);
    return { data, total, page };
  }

  async findOne(id: string, schoolId: string) {
    const teacher = await this.teacherModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId)
    }).select('-password').exec();
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async findMe(id: string, schoolId: string) {
    return this.findOne(id, schoolId);
  }

  async update(id: string, dto: UpdateTeacherDto, schoolId: string) {
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
    ).select('-password').exec();

    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async remove(id: string, schoolId: string) {
    const teacher = await this.teacherModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId)
    }).select('-password').exec();
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }
}