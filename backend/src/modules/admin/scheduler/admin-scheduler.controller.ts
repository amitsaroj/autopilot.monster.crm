import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSchedulerService } from './admin-scheduler.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Scheduler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/scheduler')
export class AdminSchedulerController {
  constructor(private readonly schedulerService: AdminSchedulerService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Get all scheduled cron jobs' })
  async getCronJobs() {
    const data = await this.schedulerService.getCronJobs();
    return {
      status: 200,
      message: 'Scheduled jobs retrieved',
      error: false,
      data,
    };
  }
}
