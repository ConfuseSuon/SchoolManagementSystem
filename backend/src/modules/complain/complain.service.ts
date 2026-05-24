import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Complain } from './complain.schema';
import { CreateComplainDto } from './dto/create-complain.dto';
import { UpdateComplainDto } from './dto/update-complain.dto';

@Injectable()
export class ComplainService {
  constructor(@InjectModel(Complain.name) private complainModel: Model<Complain>) {}

  async create(dto: CreateComplainDto, schoolId: string, studentId: string) {
    const complain = new this.complainModel({
      ...dto,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      studentId: new mongoose.Types.ObjectId(studentId),
    });
    return complain.save();
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    const [data, total] = await Promise.all([
      this.complainModel.find(query).populate('studentId', 'name email').sort({ date: -1 }).skip(skip).limit(limit).exec(),
      this.complainModel.countDocuments(query).exec()
    ]);
    return { data, total, page };
  }

  async findOne(id: string, schoolId: string, requestingRole?: string, requestingUserId?: string) {
    const filter: Record<string, unknown> = {
      _id: new mongoose.Types.ObjectId(id),
      schoolId: new mongoose.Types.ObjectId(schoolId),
    };
    if (requestingRole === 'Student' && requestingUserId) {
      filter.studentId = new mongoose.Types.ObjectId(requestingUserId);
    }
    const complain = await this.complainModel.findOne(filter).populate('studentId', 'name email').exec();
    if (!complain) throw new NotFoundException('Complain not found');
    return complain;
  }

  async update(id: string, dto: UpdateComplainDto, schoolId: string, studentId: string) {
    const complain = await this.complainModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId), studentId: new mongoose.Types.ObjectId(studentId) },
      dto,
      { new: true },
    ).populate('studentId', 'name email').exec();
    if (!complain) throw new NotFoundException('Complain not found or you do not have permission to edit it');
    return complain;
  }

  async findAllByStudent(studentId: string, schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {
      studentId: new mongoose.Types.ObjectId(studentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
    };
    const [data, total] = await Promise.all([
      this.complainModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).exec(),
      this.complainModel.countDocuments(query).exec(),
    ]);
    return { data, total, page };
  }

  async remove(id: string, schoolId: string) {
    const complain = await this.complainModel.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).exec();
    if (!complain) throw new NotFoundException('Complain not found');
    return complain;
  }
}