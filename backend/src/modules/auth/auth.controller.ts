import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminStepOneDto } from './dto/admin-step-one.dto';
import { AdminStepTwoDto } from './dto/admin-step-two.dto';
import { StaffLoginDto } from './dto/staff-login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/step-one')
  @HttpCode(HttpStatus.OK)
  async adminStepOne(@Body() dto: AdminStepOneDto) {
    return this.authService.adminStepOne(dto);
  }

  @Public()
  @Post('admin/step-two')
  @HttpCode(HttpStatus.OK)
  async adminStepTwo(@Body() dto: AdminStepTwoDto) {
    return this.authService.adminStepTwo(dto);
  }

  @Public()
  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  async staffLogin(@Body() dto: StaffLoginDto) {
    return this.authService.staffLogin(dto);
  }
}