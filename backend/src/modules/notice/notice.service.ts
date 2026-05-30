import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Notice } from './notice.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticeService {
  private readonly logger = new Logger(NoticeService.name);

  constructor(@InjectModel(Notice.name) private noticeModel: Model<Notice>) {}

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

  async create(dto: CreateNoticeDto, schoolId: string) {
    try {
      const notice = new this.noticeModel({
        ...dto,
        schoolId: new mongoose.Types.ObjectId(schoolId),
      });
      return await notice.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
      const [data, total] = await Promise.all([
        this.noticeModel.find(query).skip(skip).limit(limit).exec(),
        this.noticeModel.countDocuments(query).exec()
      ]);
      return { data, total, page };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string, schoolId: string) {
    try {
      const notice = await this.noticeModel.findOne({ 
        _id: new mongoose.Types.ObjectId(id), 
        schoolId: new mongoose.Types.ObjectId(schoolId) 
      }).exec();
      if (!notice) throw new NotFoundException('Notice not found');
      return notice;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, dto: UpdateNoticeDto, schoolId: string) {
    try {
      const notice = await this.noticeModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
        dto,
        { new: true },
      ).exec();
      if (!notice) throw new NotFoundException('Notice not found');
      return notice;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, schoolId: string) {
    try {
      const notice = await this.noticeModel.findOneAndDelete({ 
        _id: new mongoose.Types.ObjectId(id), 
        schoolId: new mongoose.Types.ObjectId(schoolId) 
      }).exec();
      if (!notice) throw new NotFoundException('Notice not found');
      return notice;
    } catch (error) {
      this.handleError(error);
    }
  }
}