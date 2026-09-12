import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminMetricsService } from './admin-metrics.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Platform Metrics')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/metrics')
export class AdminMetricsController {
  constructor(private readonly metricsService: AdminMetricsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get global platform statistics' })
  async getStats() {
    return await this.metricsService.getGlobalStats();
  }

  @Get('global')
  @ApiOperation({ summary: 'Get global platform statistics (alias)' })
  async getGlobal() {
    return this.getStats();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get global platform health' })
  async getHealth() {
    return await this.metricsService.getHealth();
  }
}
