import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { AcademicClassService } from './academic-class.service';
import { CreateAcademicClassDto } from './dto/create-academic-class.dto';
import { UpdateAcademicClassDto } from './dto/update-academic-class.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('academic-classes')
export class AcademicClassController {
  constructor(private readonly academicClassService: AcademicClassService) {}

  @Roles('Admin')
  @Post()
  create(@Body() dto: CreateAcademicClassDto, @CurrentUser() user: JwtPayload) {
    return this.academicClassService.create(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.academicClassService.findAll(user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.academicClassService.findOne(id, user.schoolId);
  }

  @Roles('Admin')
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() dto: UpdateAcademicClassDto, 
    @CurrentUser() user: JwtPayload
  ) {
    return this.academicClassService.update(id, dto, user.schoolId);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.academicClassService.remove(id, user.schoolId);
  }
}