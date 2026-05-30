import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Roles('Admin')
  @Post()
  create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.academicYearService.create(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.academicYearService.findAll(user.schoolId);
  }

  @Roles('Admin')
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.academicYearService.activate(id, user.schoolId);
  }
}
