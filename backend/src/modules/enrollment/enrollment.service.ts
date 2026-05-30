import { Injectable, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Enrollment, EnrollmentDocument } from './enrollment.schema';
import { withTransaction } from '../../common/utils/with-transaction.util';

@Injectable()
export class EnrollmentService {
  private readonly useTransactions: boolean;
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
    private configService: ConfigService,
  ) {
    this.useTransactions = this.configService.get<boolean>('USE_TRANSACTIONS', false);
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

  async findAll(academicYearId: string, classId: string, schoolId: string): Promise<EnrollmentDocument[]> {
    try {
      const query: Record<string, any> = { schoolId: new mongoose.Types.ObjectId(schoolId), isActive: true };
      if (academicYearId) {
        query.academicYearId = new mongoose.Types.ObjectId(academicYearId);
      }
      if (classId) {
        query.classId = new mongoose.Types.ObjectId(classId);
      }
      return await this.enrollmentModel.find(query).populate('studentId').exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async transfer(dto: any, schoolId: string): Promise<EnrollmentDocument> {
    try {
      const { studentId, toClassId, academicYearId } = dto;

      const activeEnrollments = await this.enrollmentModel.find({
        studentId: new mongoose.Types.ObjectId(studentId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isActive: true,
      }).exec();

      let newEnrollment: any = null;
      const db = this.enrollmentModel.db;

      await withTransaction(
        db,
        this.useTransactions,
        async (session) => {
          const options = session ? { session } : {};

          await this.enrollmentModel.updateMany(
            { studentId: new mongoose.Types.ObjectId(studentId), schoolId: new mongoose.Types.ObjectId(schoolId) },
            { isActive: false },
            options
          );

          const createdEnrollmentArray = await this.enrollmentModel.create([{
            studentId: new mongoose.Types.ObjectId(studentId),
            classId: new mongoose.Types.ObjectId(toClassId),
            academicYearId: new mongoose.Types.ObjectId(academicYearId),
            schoolId: new mongoose.Types.ObjectId(schoolId),
            isActive: true,
          }], options);
          newEnrollment = createdEnrollmentArray[0];
        },
        async () => {
          // Manual cleanup in reverse order
          if (newEnrollment) {
            await this.enrollmentModel.findByIdAndDelete(newEnrollment._id).exec();
          }
          if (activeEnrollments.length > 0) {
            const activeIds = activeEnrollments.map(e => e._id);
            await this.enrollmentModel.updateMany(
              { _id: { $in: activeIds } },
              { isActive: true }
            ).exec();
          }
        }
      );

      return newEnrollment;
    } catch (error) {
      this.handleError(error);
    }
  }
}


