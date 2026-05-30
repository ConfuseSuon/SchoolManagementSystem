import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Exam, ExamDocument } from './exam.schema';
import { ExamResult, ExamResultDocument } from './exam-result.schema';

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(
    @InjectModel(Exam.name) private examModel: Model<Exam>,
    @InjectModel(ExamResult.name) private examResultModel: Model<ExamResult>
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

  async createExam(dto: any, schoolId: string): Promise<ExamDocument> {
    try {
      const exam = new this.examModel({
        ...dto,
        schoolId: new mongoose.Types.ObjectId(schoolId),
        classId: new mongoose.Types.ObjectId(dto.classId),
        subjectId: new mongoose.Types.ObjectId(dto.subjectId),
        academicYearId: new mongoose.Types.ObjectId(dto.academicYearId),
      });
      return await exam.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findExams(classId: string, academicYearId: string, schoolId: string): Promise<ExamDocument[]> {
    try {
      const query: Record<string, any> = { schoolId: new mongoose.Types.ObjectId(schoolId) };
      if (classId) query.classId = new mongoose.Types.ObjectId(classId);
      if (academicYearId) query.academicYearId = new mongoose.Types.ObjectId(academicYearId);
      return await this.examModel.find(query).populate('subjectId', 'name').populate('classId', 'name').exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async bulkUpsertResults(examId: string, results: any[], schoolId: string): Promise<any> {
    try {
      const exam = await this.examModel.findOne({
        _id: new mongoose.Types.ObjectId(examId),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();

      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      const bulkOps = results.map((record: any) => {
        const isAbsent = record.isAbsent === true;
        const marksObtained = record.marksObtained;
        const isPassed = !isAbsent && marksObtained !== undefined && marksObtained >= exam.passingMarks;

        return {
          updateOne: {
            filter: {
              examId: exam._id,
              studentId: new mongoose.Types.ObjectId(record.studentId),
            },
            update: {
              $set: {
                schoolId: new mongoose.Types.ObjectId(schoolId),
                marksObtained: isAbsent ? undefined : marksObtained,
                isAbsent,
                isPassed,
              }
            },
            upsert: true,
          }
        };
      });

      await this.examResultModel.bulkWrite(bulkOps);
      return { message: 'Exam results updated successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getResults(examId: string, schoolId: string): Promise<ExamResultDocument[]> {
    try {
      const examExists = await this.examModel.exists({
        _id: new mongoose.Types.ObjectId(examId),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      });
      if (!examExists) {
        throw new NotFoundException('Exam not found');
      }

      return await this.examResultModel.find({
        examId: new mongoose.Types.ObjectId(examId),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).populate('studentId', 'name rollNumber').exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStudentResults(studentId: string, academicYearId: string, schoolId: string): Promise<any[]> {
    try {
      const exams = await this.examModel.find({
        academicYearId: new mongoose.Types.ObjectId(academicYearId),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).populate('subjectId', 'name').exec();

      const examIds = exams.map(e => e._id);

      const results = await this.examResultModel.find({
        examId: { $in: examIds },
        studentId: new mongoose.Types.ObjectId(studentId),
        schoolId: new mongoose.Types.ObjectId(schoolId)
      }).exec();

      return results.map(result => {
        const exam = exams.find(e => e._id.toString() === result.examId.toString());
        return {
          resultId: result._id,
          examId: result.examId,
          examName: exam?.name || 'N/A',
          subjectName: (exam?.subjectId as any)?.name || 'N/A',
          maxMarks: exam?.maxMarks || 0,
          passingMarks: exam?.passingMarks || 0,
          marksObtained: result.marksObtained,
          isAbsent: result.isAbsent,
          isPassed: result.isPassed,
        };
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}

