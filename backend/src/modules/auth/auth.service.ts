import { Injectable, UnauthorizedException, ForbiddenException, Logger, ConflictException, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminStepOneDto } from './dto/admin-step-one.dto';
import { AdminStepTwoDto } from './dto/admin-step-two.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { School } from '../school/school.schema';
import { User } from '../user/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

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

  async adminStepOne(dto: AdminStepOneDto) {
    try {
      const user = await this.userModel.findOne({ email: dto.email, role: 'Admin' }).exec();
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const schools = await this.schoolModel.find({ adminId: user.profileId }).select('_id name');
      const tempToken = this.jwtService.sign(
        { sub: user._id.toString(), isTemp: true },
        { expiresIn: '15m' }
      );
      return {
        tempToken,
        schools,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async adminStepTwo(dto: AdminStepTwoDto) {
    try {
      let userId: string;
      try {
        const decoded = this.jwtService.verify(dto.tempToken);
        if (!decoded.isTemp) throw new UnauthorizedException('Invalid token type');
        userId = decoded.sub;
      } catch (err) {
        this.logger.error('JWT verification failed', err);
        throw new UnauthorizedException('Invalid or expired temp token');
      }

      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const school = await this.schoolModel.findOne({
        _id: new mongoose.Types.ObjectId(dto.schoolId),
        adminId: user.profileId,
      });

      if (!school) {
        throw new ForbiddenException('Admin does not own this school or school does not exist');
      }

      const payload = {
        sub: user.profileId.toString(),
        userId: user._id.toString(),
        role: 'Admin',
        schoolId: dto.schoolId,
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async staffLogin(dto: StaffLoginDto) {
    try {
      const user = await this.userModel.findOne({ 
        email: dto.email,
        schoolId: new mongoose.Types.ObjectId(dto.schoolId),
        role: dto.role 
      }).exec();

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.profileId.toString(),
        userId: user._id.toString(),
        role: user.role,
        schoolId: user.schoolId.toString(),
      };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}