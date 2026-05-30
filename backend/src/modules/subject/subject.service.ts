import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Subject } from './subject.schema';
import { ValidationService } from '../shared/validation.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    private validationService: ValidationService,
  ) { }

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

  async create(dto: CreateSubjectDto, schoolId: string) {
    try {
      await this.validationService.validateClass(dto.classId, schoolId);
      if (dto.teacherId) {
        await this.validationService.validateTeacher(dto.teacherId, schoolId);
      }

      const code = dto.code || dto.name.toUpperCase().replace(/\s+/g, '-').slice(0, 6);
      const subject = new this.subjectModel({
        ...dto,
        code,
        schoolId: new mongoose.Types.ObjectId(schoolId),
        classId: new mongoose.Types.ObjectId(dto.classId),
        teacherId: dto.teacherId ? new mongoose.Types.ObjectId(dto.teacherId) : undefined,
      });
      return await subject.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
      const [data, total] = await Promise.all([
        this.subjectModel.find(query).populate('classId', 'name').populate('teacherId', 'name email').skip(skip).limit(limit).exec(),
        this.subjectModel.countDocuments(query).exec()
      ]);
      return { data, total, page };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string, schoolId: string) {
    try {
      const subject = await this.subjectModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).populate('classId', 'name').populate('teacherId', 'name email').exec();
      if (!subject) throw new NotFoundException('Subject not found');
      return subject;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, dto: UpdateSubjectDto, schoolId: string) {
    try {
      const updateData: Record<string, unknown> = { ...dto };
      if (dto.classId) {
        await this.validationService.validateClass(dto.classId, schoolId);
        updateData.classId = new mongoose.Types.ObjectId(dto.classId);
      }
      if (dto.teacherId) {
        await this.validationService.validateTeacher(dto.teacherId, schoolId);
        updateData.teacherId = new mongoose.Types.ObjectId(dto.teacherId);
      }

      const subject = await this.subjectModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) },
        updateData,
        { new: true },
      ).exec();

      if (!subject) throw new NotFoundException('Subject not found');
      return subject;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, schoolId: string) {
    try {
      const subject = await this.subjectModel.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();
      if (!subject) throw new NotFoundException('Subject not found');
      return subject;
    } catch (error) {
      this.handleError(error);
    }
  }
}