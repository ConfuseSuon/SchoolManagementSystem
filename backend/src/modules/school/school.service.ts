import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import mongoose from 'mongoose';

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
  ) { }

  async search(q: string, limit: number) {
    try {
      if (!q || q.length < 3) {
        throw new BadRequestException('Query must be at least 3 characters long');
      }
      const capLimit = Math.min(limit || 10, 20);
      return await this.schoolModel
        .find({ name: { $regex: q, $options: 'i' } })
        .limit(capLimit)
        .select('_id name')
        .exec();
    } catch (error) {
      this.handleError(error);
    }
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

  async create(createSchoolDto: CreateSchoolDto, adminId: string) {
    try {
      const school = new this.schoolModel({
        ...createSchoolDto,
        adminId,
      });
      return await school.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllByAdmin(schoolId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = { adminId: new mongoose.Types.ObjectId(schoolId) };
      const [data, total] = await Promise.all([
        this.schoolModel.find(query).skip(skip).limit(limit).exec(),
        this.schoolModel.countDocuments(query).exec()
      ]);
      return { data, total, page };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string, adminId: string) {
    try {
      const school = await this.schoolModel.findOne({ _id: new mongoose.Types.ObjectId(id), adminId: new mongoose.Types.ObjectId(adminId) }).exec();
      if (!school) {
        throw new NotFoundException('School not found or access denied');
      }
      return school;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto, adminId: string) {
    try {
      const school = await this.schoolModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          adminId: new mongoose.Types.ObjectId(adminId),
        },
        updateSchoolDto,
        { new: true },
      ).exec();

      if (!school) {
        throw new NotFoundException('School not found or access denied');
      }
      return school;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string, adminId: string) {
    try {
      const school = await this.schoolModel.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        adminId: new mongoose.Types.ObjectId(adminId),
      }).exec();
      if (!school) {
        throw new NotFoundException('School not found or access denied');
      }
      return school;
    } catch (error) {
      this.handleError(error);
    }
  }
}