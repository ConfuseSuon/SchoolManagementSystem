import { Query,  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards  } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Roles('Admin')
  @Post()
  create(@Body() dto: CreateNoticeDto, @CurrentUser() user: JwtPayload) {
    return this.noticeService.create(dto, user.schoolId);
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get()
  async findAll(@CurrentUser() user: JwtPayload, @Query('page') page?: string, @Query('limit') limit?: string) {
    const p = parseInt(page || '1', 10);
    const l = parseInt(limit || '10', 10);
    const result = await this.noticeService.findAll(user.schoolId, p, l);
    return { data: result.data, message: 'Success', meta: { page: result.page, total: result.total } };
  }

  @Roles('Admin', 'Teacher', 'Student')
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.noticeService.findOne(id, user.schoolId);
  }

  @Roles('Admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto, @CurrentUser() user: JwtPayload) {
    return this.noticeService.update(id, dto, user.schoolId);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.noticeService.remove(id, user.schoolId);
  }
}