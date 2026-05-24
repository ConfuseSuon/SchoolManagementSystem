import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.schema';
import { School } from '../school/school.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(School.name) private schoolModel: Model<School>
  ) {}

  async register(createAdminDto: CreateAdminDto) {
    const existing = await this.adminModel.findOne({ email: createAdminDto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    const admin = new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    });
    
    await admin.save();

    try {
      const school = new this.schoolModel({
        name: createAdminDto.schoolName,
        address: createAdminDto.schoolAddress,
        adminId: admin._id,
      });
      await school.save();
      return { message: 'Admin registered successfully' };
    } catch (error) {
      await this.adminModel.findByIdAndDelete(admin._id);
      throw error;
    }
  }

  async getProfile(adminId: string) {
    const admin = await this.adminModel.findById(new mongoose.Types.ObjectId(adminId)).select('-password');
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async updateProfile(adminId: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(adminId),
      updateAdminDto,
      { new: true }
    ).select('-password');
    
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.adminModel.findById(new mongoose.Types.ObjectId(adminId));
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect old password');
    }

    admin.password = await bcrypt.hash(dto.newPassword, 10);
    await admin.save();
    
    return { message: 'Password changed successfully' };
  }
}