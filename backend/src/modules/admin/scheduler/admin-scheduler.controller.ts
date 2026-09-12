import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSchedulerService } from './admin-scheduler.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Scheduler')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/scheduler')
export class AdminSchedulerController {
  constructor(private readonly schedulerService: AdminSchedulerService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Get all scheduled cron jobs' })
  async getCronJobs() {
    return await this.schedulerService.getCronJobs();
  }
}
