import { Injectable, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AcademicYear, AcademicYearDocument } from './academic-year.schema';
import { withTransaction } from '../../common/utils/with-transaction.util';

@Injectable()
export class AcademicYearService {
  private readonly useTransactions: boolean;
  private readonly logger = new Logger(AcademicYearService.name);

  constructor(
    @InjectModel(AcademicYear.name) private academicYearModel: Model<AcademicYear>,
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

  async create(dto: any, schoolId: string): Promise<AcademicYearDocument> {
    try {
      const previouslyActiveYears = await this.academicYearModel.find({
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isActive: true,
      }).exec();

      let created: any = null;
      const db = this.academicYearModel.db;

      await withTransaction(
        db,
        this.useTransactions,
        async (session) => {
          const options = session ? { session } : {};

          if (dto.isActive === true) {
            await this.academicYearModel.updateMany(
              { schoolId: new mongoose.Types.ObjectId(schoolId) },
              { isActive: false },
              options
            );
          }

          const createdArray = await this.academicYearModel.create([{
            ...dto,
            schoolId: new mongoose.Types.ObjectId(schoolId),
          }], options);
          created = createdArray[0];
        },
        async () => {
          // Manual cleanup in reverse order
          if (created) {
            await this.academicYearModel.findByIdAndDelete(created._id).exec();
          }
          if (dto.isActive === true && previouslyActiveYears.length > 0) {
            const activeIds = previouslyActiveYears.map(y => y._id);
            await this.academicYearModel.updateMany(
              { _id: { $in: activeIds } },
              { isActive: true }
            ).exec();
          }
        }
      );

      return created;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(schoolId: string): Promise<AcademicYearDocument[]> {
    try {
      return await this.academicYearModel.find({ schoolId: new mongoose.Types.ObjectId(schoolId) }).exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async activate(id: string, schoolId: string): Promise<AcademicYearDocument> {
    try {
      const previouslyActiveYears = await this.academicYearModel.find({
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isActive: true,
      }).exec();

      let updatedYear: any = null;
      const db = this.academicYearModel.db;

      await withTransaction(
        db,
        this.useTransactions,
        async (session) => {
          const options = session ? { session } : {};

          const year = await this.academicYearModel.findOne({
            _id: new mongoose.Types.ObjectId(id),
            schoolId: new mongoose.Types.ObjectId(schoolId),
          }, null, options);

          if (!year) {
            throw new NotFoundException('Academic year not found');
          }

          await this.academicYearModel.updateMany(
            { schoolId: new mongoose.Types.ObjectId(schoolId) },
            { isActive: false },
            options
          );

          year.isActive = true;
          await year.save(options);
          updatedYear = year;
        },
        async () => {
          // Manual cleanup in reverse order
          await this.academicYearModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { isActive: false }
          ).exec();

          if (previouslyActiveYears.length > 0) {
            const activeIds = previouslyActiveYears.map(y => y._id);
            await this.academicYearModel.updateMany(
              { _id: { $in: activeIds } },
              { isActive: true }
            ).exec();
          }
        }
      );

      return updatedYear;
    } catch (error) {
      this.handleError(error);
    }
  }
}


