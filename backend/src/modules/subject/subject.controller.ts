import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) { }

  @Roles('Admin')
  @Post()
  create(@Body() dto: CreateSubjectDto, @CurrentUser() user: JwtPayload) {
    return this.subjectService.create(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.subjectService.findAll(user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subjectService.findOne(id, user.schoolId);
  }

  @Roles('Admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto, @CurrentUser() user: JwtPayload) {
    return this.subjectService.update(id, dto, user.schoolId);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.subjectService.remove(id, user.schoolId);
  }
}