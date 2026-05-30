import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Roles('Admin', 'Teacher')
  @Post()
  create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.examService.createExam(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get()
  findExams(
    @Query('classId') classId: string,
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.examService.findExams(classId, academicYearId, user.schoolId);
  }

  @Roles('Admin', 'Teacher')
  @Post(':examId/results')
  bulkUpsertResults(
    @Param('examId') examId: string,
    @Body() body: any,
    @CurrentUser() user: JwtPayload
  ) {
    const results = Array.isArray(body) ? body : body.results || [];
    return this.examService.bulkUpsertResults(examId, results, user.schoolId);
  }

  @Roles('Admin', 'Teacher')
  @Get(':examId/results')
  getResults(@Param('examId') examId: string, @CurrentUser() user: JwtPayload) {
    return this.examService.getResults(examId, user.schoolId);
  }

  @Roles('Student')
  @Get('my-results')
  getMyResults(
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.examService.getStudentResults(user.sub, academicYearId, user.schoolId);
  }
}
