import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles('Teacher')
  @Post()
  bulkUpsert(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.attendanceService.bulkUpsert(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher')
  @Get()
  findAttendance(
    @Query('subjectId') subjectId: string,
    @Query('classId') classId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('date') date: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.attendanceService.findAttendance(subjectId, classId, academicYearId, date, user.schoolId);
  }

  @Roles('Student')
  @Get('my-summary')
  getMySummary(
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.attendanceService.getStudentSummary(user.sub, academicYearId, user.schoolId);
  }
}
