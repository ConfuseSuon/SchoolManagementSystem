import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@Controller('schools')
@UseGuards(RolesGuard)
@Roles('Admin')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  create(@Body() createSchoolDto: CreateSchoolDto, @CurrentUser() user: JwtPayload) {
    return this.schoolService.create(createSchoolDto, user.sub);
  }

  @Get()
  async findAllByAdmin(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.schoolService.findAllByAdmin(user.sub, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.schoolService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateSchoolDto: UpdateSchoolDto, 
    @CurrentUser() user: JwtPayload
  ) {
    return this.schoolService.update(id, updateSchoolDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.schoolService.remove(id, user.sub);
  }
}