import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException, InternalServerErrorException, HttpException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Admin } from './admin.schema';
import { School } from '../school/school.schema';
import { User } from '../user/user.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { withTransaction } from '../../common/utils/with-transaction.util';

@Injectable()
export class AdminService {
  private readonly useTransactions: boolean;
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  async register(createAdminDto: CreateAdminDto) {
    try {
      // In admin.service.ts register method, the pre-check findOne({ email }) is a global email check.
      // This is intentional for Admin registration only since the school doesn't exist yet.
      const existing = await this.userModel.findOne({ email: createAdminDto.email });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      let createdAdmin: any = null;
      let createdSchool: any = null;
      let createdUser: any = null;

      const db = this.adminModel.db;

      await withTransaction(
        db,
        this.useTransactions,
        async (session) => {
          const options = session ? { session } : {};

          const createdAdminArray = await this.adminModel.create([{ name: createAdminDto.name }], options);
          createdAdmin = createdAdminArray[0];

          const createdSchoolArray = await this.schoolModel.create([{
            name: createAdminDto.schoolName,
            address: createAdminDto.schoolAddress,
            adminId: createdAdmin._id,
          }], options);
          createdSchool = createdSchoolArray[0];

          const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
          const createdUserArray = await this.userModel.create([{
            email: createAdminDto.email,
            password: hashedPassword,
            role: 'Admin',
            schoolId: createdSchool._id,
            profileId: createdAdmin._id,
            profileModel: 'Admin',
          }], options);
          createdUser = createdUserArray[0];
        },
        async () => {
          // Manual cleanup in reverse order
          if (createdUser) {
            await this.userModel.findByIdAndDelete(createdUser._id).exec();
          }
          if (createdSchool) {
            await this.schoolModel.findByIdAndDelete(createdSchool._id).exec();
          }
          if (createdAdmin) {
            await this.adminModel.findByIdAndDelete(createdAdmin._id).exec();
          }
        }
      );

      return { message: 'Admin registered successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(adminId: string) {
    try {
      const admin = await this.adminModel
        .findById(new mongoose.Types.ObjectId(adminId))
        .lean()
        .exec();

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      const user = await this.userModel
        .findOne({
          profileId: admin._id,
          profileModel: 'Admin',
        })
        .select('email role')
        .lean()
        .exec();

      return {
        ...admin,
        email: user?.email ?? null,
        role: user?.role ?? null,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(adminId: string, updateAdminDto: UpdateAdminDto) {
    try {
      const admin = await this.adminModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(adminId),
        updateAdminDto,
        { new: true }
      ).exec();

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }
      return admin;
    } catch (error) {
      this.handleError(error);
    }
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.userModel.findOne({
        profileId: new mongoose.Types.ObjectId(adminId),
        profileModel: 'Admin'
      });
      if (!user) {
        throw new NotFoundException('Admin user account not found');
      }

      const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Incorrect old password');
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }
}