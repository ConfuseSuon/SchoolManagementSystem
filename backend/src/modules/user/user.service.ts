import { Injectable, ConflictException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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

  async findByEmailAndSchool(email: string, schoolId: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ 
        email, 
        schoolId: new mongoose.Types.ObjectId(schoolId) 
      }).exec();
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(dto: Partial<User>): Promise<UserDocument> {
    try {
      const existing = await this.userModel.findOne({
        email: dto.email,
        schoolId: dto.schoolId,
      });
      if (existing) {
        throw new ConflictException('Email already in use for this school');
      }
      const user = new this.userModel(dto);
      return await user.save();
    } catch (error) {
      this.handleError(error);
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(new mongoose.Types.ObjectId(id)).exec();
    } catch (error) {
      this.handleError(error);
    }
  }
}

