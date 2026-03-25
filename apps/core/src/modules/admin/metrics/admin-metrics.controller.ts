import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminMetricsService } from './admin-metrics.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Platform Metrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/metrics')
export class AdminMetricsController {
  constructor(private readonly metricsService: AdminMetricsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get global platform statistics' })
  async getStats() {
    const data = await this.metricsService.getGlobalStats();
    return {
      status: 200,
      message: 'Platform statistics retrieved',
      error: false,
      data,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get global platform health' })
  async getHealth() {
    const data = await this.metricsService.getHealth();
    return {
      status: 200,
      message: 'Platform health retrieved',
      error: false,
      data,
    };
  }
}
