import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AcademicClass } from './academic-class.schema';
import { CreateAcademicClassDto } from './dto/create-academic-class.dto';
import { UpdateAcademicClassDto } from './dto/update-academic-class.dto';

@Injectable()
export class AcademicClassService {
  constructor(
    @InjectModel(AcademicClass.name) private academicClassModel: Model<AcademicClass>,
  ) {}

  async create(dto: CreateAcademicClassDto, schoolId: string) {
    const academicClass = new this.academicClassModel({
      ...dto,
      schoolId: new mongoose.Types.ObjectId(schoolId),
    });
    return academicClass.save();
  }

  async findAll(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
    const [data, total] = await Promise.all([
      this.academicClassModel.find(query).skip(skip).limit(limit).exec(),
      this.academicClassModel.countDocuments(query).exec()
    ]);
    return { data, total, page };
  }

  async findOne(id: string, schoolId: string) {
    const academicClass = await this.academicClassModel.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).exec();
    if (!academicClass) {
      throw new NotFoundException('Class not found or access denied');
    }
    return academicClass;
  }

  async update(id: string, dto: UpdateAcademicClassDto, schoolId: string) {
    const academicClass = await this.academicClassModel.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(id), 
        schoolId: new mongoose.Types.ObjectId(schoolId) 
      },
      dto,
      { new: true },
    ).exec();
    
    if (!academicClass) {
      throw new NotFoundException('Class not found or access denied');
    }
    return academicClass;
  }

  async remove(id: string, schoolId: string) {
    const academicClass = await this.academicClassModel.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(id), 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).exec();
    if (!academicClass) {
      throw new NotFoundException('Class not found or access denied');
    }
    return academicClass;
  }
}