import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AcademicClass } from '../academic-class/academic-class.schema';
import { Subject } from '../subject/subject.schema';
import { Teacher } from '../teacher/teacher.schema';

@Injectable()
export class ValidationService {
  constructor(
    @InjectModel(AcademicClass.name) private academicClassModel: Model<AcademicClass>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
  ) {}

  async validateClass(id: string, schoolId: string) {
    const exists = await this.academicClassModel.exists({ _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) });
    if (!exists) throw new NotFoundException('Class not found in this school');
  }

  async validateSubject(id: string, schoolId: string) {
    const exists = await this.subjectModel.exists({ _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) });
    if (!exists) throw new NotFoundException('Subject not found in this school');
  }

  async validateTeacher(id: string, schoolId: string) {
    const exists = await this.teacherModel.exists({ _id: new mongoose.Types.ObjectId(id), schoolId: new mongoose.Types.ObjectId(schoolId) });
    if (!exists) throw new NotFoundException('Teacher not found in this school');
  }
}