import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get main dashboard metrics' })
  async getDashboard(@TenantId() tenantId: string) {
    // Aggregates across multiple metrics
    const contacts = await this.analyticsService.getMetrics(tenantId, 'contacts_total', 'DAILY');
    const deals = await this.analyticsService.getMetrics(tenantId, 'deals_value', 'DAILY');
    const calls = await this.analyticsService.getMetrics(tenantId, 'calls_total', 'DAILY');

    return {
      contacts: contacts[0]?.value || 0,
      deals: deals[0]?.value || 0,
      calls: calls[0]?.value || 0,
      period: 'last_24h',
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get specific metrics' })
  async getMetrics(
    @TenantId() tenantId: string,
    @Query('name') name: string,
    @Query('period') period: string = 'DAILY',
  ) {
    return this.analyticsService.getMetrics(tenantId, name, period);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get generated reports' })
  async getReports(@TenantId() tenantId: string) {
    console.log(`Fetching reports for tenant ${tenantId}`);
    return [];
  }
}
