import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Roles('Admin')
  @Post()
  create(@Body() dto: CreateStudentDto, @CurrentUser() user: JwtPayload) {
    return this.studentService.create(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.studentService.findAll(user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Roles('Student')
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.studentService.findOne(user.sub, user.schoolId);
  }

  @Roles('Admin', 'Teacher')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studentService.findOne(id, user.schoolId);
  }

  @Roles('Admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto, @CurrentUser() user: JwtPayload) {
    return this.studentService.update(id, dto, user.schoolId);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.studentService.remove(id, user.schoolId);
  }

  @Roles('Admin')
  @Post(':id/login')
  createLogin(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.studentService.createLogin(id, dto, user.schoolId);
  }
}