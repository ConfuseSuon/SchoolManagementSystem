import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { School } from './school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import mongoose from 'mongoose';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
  ) { }

  async create(createSchoolDto: CreateSchoolDto, adminId: string) {
    const school = new this.schoolModel({
      ...createSchoolDto,
      adminId,
    });
    return school.save();
  }

  async findAllByAdmin(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { adminId: new mongoose.Types.ObjectId(schoolId) };
    const [data, total] = await Promise.all([
      this.schoolModel.find(query).skip(skip).limit(limit).exec(),
      this.schoolModel.countDocuments(query).exec()
    ]);
    return { data, total, page };
  }

  async findOne(id: string, adminId: string) {
    const school = await this.schoolModel.findOne({ _id: new mongoose.Types.ObjectId(id), adminId: new mongoose.Types.ObjectId(adminId) }).exec();
    if (!school) {
      throw new NotFoundException('School not found or access denied');
    }
    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto, adminId: string) {
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
  }

  async remove(id: string, adminId: string) {
    const school = await this.schoolModel.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      adminId: new mongoose.Types.ObjectId(adminId),
    }).exec();
    if (!school) {
      throw new NotFoundException('School not found or access denied');
    }
    return school;
  }
}