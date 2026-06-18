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

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard KPI summary' })
  async getOverview(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getOverview(tenantId);
    return { status: 200, message: 'Overview retrieved', error: false, data };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get main dashboard metrics (legacy)' })
  async getDashboard(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getOverview(tenantId);
    return { status: 200, message: 'Dashboard retrieved', error: false, data };
  }

  @Get('crm')
  @ApiOperation({ summary: 'CRM KPIs' })
  async getCrm(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getCrmAnalytics(tenantId);
    return { status: 200, message: 'CRM analytics retrieved', error: false, data };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue analytics' })
  async getRevenue(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getRevenueAnalytics(tenantId);
    return { status: 200, message: 'Revenue analytics retrieved', error: false, data };
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Pipeline funnel analytics' })
  async getPipeline(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getPipelineAnalytics(tenantId);
    return { status: 200, message: 'Pipeline analytics retrieved', error: false, data };
  }

  @Get('team')
  @ApiOperation({ summary: 'Team performance analytics' })
  async getTeam(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getTeamAnalytics(tenantId);
    return { status: 200, message: 'Team analytics retrieved', error: false, data };
  }

  @Get('voice')
  @ApiOperation({ summary: 'Voice call analytics' })
  async getVoice(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getVoiceAnalytics(tenantId);
    return { status: 200, message: 'Voice analytics retrieved', error: false, data };
  }

  @Get('whatsapp')
  @ApiOperation({ summary: 'WhatsApp message analytics' })
  async getWhatsapp(@TenantId() tenantId: string) {
    const data = await this.analyticsService.getWhatsappAnalytics(tenantId);
    return { status: 200, message: 'WhatsApp analytics retrieved', error: false, data };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get specific metrics' })
  async getMetrics(
    @TenantId() tenantId: string,
    @Query('name') name: string,
    @Query('period') period: string = 'DAILY',
  ) {
    const data = await this.analyticsService.getMetrics(tenantId, name, period);
    return { status: 200, message: 'Metrics retrieved', error: false, data };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get generated reports' })
  async getReports(@TenantId() tenantId: string) {
    return {
      status: 200,
      message: 'Reports retrieved',
      error: false,
      data: [],
      meta: { tenantId },
    };
  }
}
