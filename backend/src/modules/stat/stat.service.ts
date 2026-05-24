import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { School } from '../school/school.schema';
import { AcademicClass } from '../academic-class/academic-class.schema';
import { Teacher } from '../teacher/teacher.schema';
import { Student } from '../student/student.schema';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(AcademicClass.name) private classModel: Model<AcademicClass>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
  ) {}

  async getAdminStats(adminId: string, schoolId: string) {
    const totalSchools = await this.schoolModel
      .countDocuments({ adminId: new mongoose.Types.ObjectId(adminId) })
      .exec();

    const targetSchoolId = new mongoose.Types.ObjectId(schoolId);

    const [totalClasses, totalTeachers, totalStudents] = await Promise.all([
      this.classModel.countDocuments({ schoolId: targetSchoolId }),
      this.teacherModel.countDocuments({ schoolId: targetSchoolId }),
      this.studentModel.countDocuments({ schoolId: targetSchoolId }),
    ]);

    return {
      totalSchools,
      totalClasses,
      totalTeachers,
      totalStudents,
    };
  }
}
