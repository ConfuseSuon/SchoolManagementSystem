import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './attendance.schema';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>
  ) {}

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

  async bulkUpsert(dto: any, schoolId: string): Promise<any> {
    try {
      const { subjectId, classId, academicYearId, date, records } = dto;
      
      const parsedDate = new Date(date);
      parsedDate.setUTCHours(0, 0, 0, 0);

      const bulkOps = records.map((record: any) => ({
        updateOne: {
          filter: {
            studentId: new mongoose.Types.ObjectId(record.studentId),
            subjectId: new mongoose.Types.ObjectId(subjectId),
            date: parsedDate,
          },
          update: {
            $set: {
              classId: new mongoose.Types.ObjectId(classId),
              academicYearId: new mongoose.Types.ObjectId(academicYearId),
              schoolId: new mongoose.Types.ObjectId(schoolId),
              status: record.status,
            }
          },
          upsert: true,
        }
      }));

      await this.attendanceModel.bulkWrite(bulkOps);
      return { message: 'Attendance records updated successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAttendance(subjectId: string, classId: string, academicYearId: string, date: string, schoolId: string): Promise<AttendanceDocument[]> {
    try {
      const query: Record<string, any> = { schoolId: new mongoose.Types.ObjectId(schoolId) };
      if (subjectId) query.subjectId = new mongoose.Types.ObjectId(subjectId);
      if (classId) query.classId = new mongoose.Types.ObjectId(classId);
      if (academicYearId) query.academicYearId = new mongoose.Types.ObjectId(academicYearId);
      if (date) {
        const parsedDate = new Date(date);
        parsedDate.setUTCHours(0, 0, 0, 0);
        query.date = parsedDate;
      }
      return await this.attendanceModel.find(query).populate('studentId', 'name').exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStudentSummary(studentId: string, academicYearId: string, schoolId: string): Promise<any> {
    try {
      const records = await this.attendanceModel.find({
        studentId: new mongoose.Types.ObjectId(studentId),
        academicYearId: new mongoose.Types.ObjectId(academicYearId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
      }).populate('subjectId', 'name').exec();

      const summaryMap: Record<string, { subjectName: string, total: number, attended: number }> = {};

      for (const record of records) {
        const subject = record.subjectId as any;
        if (!subject) continue;
        const subId = subject._id.toString();
        if (!summaryMap[subId]) {
          summaryMap[subId] = {
            subjectName: subject.name,
            total: 0,
            attended: 0,
          };
        }
        summaryMap[subId].total += 1;
        if (record.status === 'Present' || record.status === 'Late') {
          summaryMap[subId].attended += 1;
        } else if (record.status === 'HalfDay') {
          summaryMap[subId].attended += 0.5;
        }
      }

      return Object.keys(summaryMap).map(subId => {
        const item = summaryMap[subId];
        return {
          subjectId: subId,
          subjectName: item.subjectName,
          totalClasses: item.total,
          attendedClasses: item.attended,
          percentage: item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0,
        };
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

