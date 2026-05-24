import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatService } from './stat.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type JwtPayload } from '../../common/decorators/current-user.decorator';

@UseGuards(RolesGuard)
@Controller('stats')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Roles('Admin')
  @Get()
  getStats(@CurrentUser() user: JwtPayload) {
    return this.statService.getAdminStats(user.sub, user.schoolId);
  }
}
