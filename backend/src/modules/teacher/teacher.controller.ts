import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Roles('Admin')
@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  create(@Body() dto: CreateTeacherDto, @CurrentUser() user: JwtPayload) {
    return this.teacherService.create(dto, user.schoolId);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.teacherService.findAll(user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Get('me')
  @Roles('Teacher')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.teacherService.findMe(user.sub, user.schoolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.teacherService.findOne(id, user.schoolId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto, @CurrentUser() user: JwtPayload) {
    return this.teacherService.update(id, dto, user.schoolId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.teacherService.remove(id, user.schoolId);
  }

  @Post(':id/login')
  createLogin(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.teacherService.createLogin(id, dto, user.schoolId);
  }
}