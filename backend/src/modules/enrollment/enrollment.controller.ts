import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Roles('Admin', 'Teacher')
  @Get()
  findAll(
    @Query('academicYearId') academicYearId: string,
    @Query('classId') classId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.enrollmentService.findAll(academicYearId, classId, user.schoolId);
  }

  @Roles('Admin')
  @Post('transfer')
  transfer(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.enrollmentService.transfer(dto, user.schoolId);
  }
}
