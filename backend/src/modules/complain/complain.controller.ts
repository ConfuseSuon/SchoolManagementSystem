import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { ComplainService } from './complain.service';
import { CreateComplainDto } from './dto/create-complain.dto';
import { UpdateComplainDto } from './dto/update-complain.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('complains')
export class ComplainController {
  constructor(private readonly complainService: ComplainService) {}

  @Roles('Student')
  @Post()
  create(@Body() dto: CreateComplainDto, @CurrentUser() user: JwtPayload) {
    return this.complainService.create(dto, user.schoolId, user.sub);
  }

  @Roles('Student')
  @Get('mine')
  async getMyComplains(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.complainService.findAllByStudent(user.sub, user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Roles('Admin', 'Student')
  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.complainService.findAll(user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Roles('Admin', 'Student')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    // Note: Admin can read any, Student ideally only theirs, handled softly here by scoping or strict match. 
    return this.complainService.findOne(id, user.schoolId, user.role, user.sub);
  }

  @Roles('Student')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateComplainDto, @CurrentUser() user: JwtPayload) {
    return this.complainService.update(id, dto, user.schoolId, user.sub);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.complainService.remove(id, user.schoolId);
  }
}