import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminStepOneDto } from './dto/admin-step-one.dto';
import { AdminStepTwoDto } from './dto/admin-step-two.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { Admin } from '../admin/admin.schema';
import { School } from '../school/school.schema';
import { Teacher } from '../teacher/teacher.schema';
import { Student } from '../student/student.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private jwtService: JwtService,
  ) { }

  private readonly logger = new Logger(AuthService.name);

  async adminStepOne(dto: AdminStepOneDto) {
    const admin = await this.adminModel.findOne({ email: dto.email });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const schools = await this.schoolModel.find({ adminId: admin._id }).select('_id name');
    const tempToken = this.jwtService.sign(
      { sub: admin._id.toString(), isTemp: true },
      { expiresIn: '15m' }
    );
    return {
      tempToken,
      schools,
    };
  }

  async adminStepTwo(dto: AdminStepTwoDto) {
    let adminId: string;
    try {
      const decoded = this.jwtService.verify(dto.tempToken);
      if (!decoded.isTemp) throw new UnauthorizedException('Invalid token type');
      adminId = decoded.sub;
    } catch (err) {
      this.logger.error('JWT verification failed', err);
      throw new UnauthorizedException('Invalid or expired temp token');
    }

    const school = await this.schoolModel.findOne({
      _id: new mongoose.Types.ObjectId(dto.schoolId),
      adminId: new mongoose.Types.ObjectId(adminId),
    });

    if (!school) {
      throw new ForbiddenException('Admin does not own this school or school does not exist');
    }

    const payload = { sub: adminId, role: 'Admin', schoolId: dto.schoolId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async staffLogin(dto: StaffLoginDto) {
    let user;
    let ModelClass: Model<any>;

    if (dto.role === 'Teacher') {
      ModelClass = this.teacherModel;
    } else if (dto.role === 'Student') {
      ModelClass = this.studentModel;
    } else {
      throw new UnauthorizedException('Invalid role');
    }

    user = await ModelClass.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: (user as any)._id.toString(), role: user.role, schoolId: user.schoolId.toString() };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}