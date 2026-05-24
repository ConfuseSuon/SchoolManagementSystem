import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Notice } from './notice.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticeService {
  constructor(@InjectModel(Notice.name) private noticeModel: Model<Notice>) {}

  async create(dto: CreateNoticeDto, schoolId: string) {
    const notice = new this.noticeModel({
      ...dto,
      schoolId: new mongoose.Types.ObjectId(schoolId),
    });
    return notice.save();
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    const [data, total] = await Promise.all([
      this.noticeModel.find(query).skip(skip).limit(limit).exec(),
      this.noticeModel.countDocuments(query).exec()
    ]);
    return { data, total, page };
  }

  async findOne(id: string, schoolId: string) {
    const notice = await this.noticeModel.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).exec();
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async update(id: string, dto: UpdateNoticeDto, schoolId: string) {
    const notice = await this.noticeModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
      dto,
      { new: true },
    ).exec();
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async remove(id: string, schoolId: string) {
    const notice = await this.noticeModel.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).exec();
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }
}