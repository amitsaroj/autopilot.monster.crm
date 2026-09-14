import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { AnalyticsService } from './analytics.service';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('analytics')
@PlanFeature('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly advancedAnalyticsService: AdvancedAnalyticsService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard KPI summary' })
  async getOverview(@TenantId() tenantId: string) {
    return await this.analyticsService.getOverview(tenantId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get main dashboard metrics (legacy)' })
  async getDashboard(@TenantId() tenantId: string) {
    return await this.analyticsService.getOverview(tenantId);
  }

  @Get('crm')
  @ApiOperation({ summary: 'CRM KPIs' })
  async getCrm(@TenantId() tenantId: string) {
    return await this.analyticsService.getCrmAnalytics(tenantId);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue analytics' })
  async getRevenue(@TenantId() tenantId: string) {
    return await this.analyticsService.getRevenueAnalytics(tenantId);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Pipeline funnel analytics' })
  async getPipeline(@TenantId() tenantId: string) {
    return await this.analyticsService.getPipelineAnalytics(tenantId);
  }

  @Get('team')
  @ApiOperation({ summary: 'Team performance analytics' })
  async getTeam(@TenantId() tenantId: string) {
    return await this.analyticsService.getTeamAnalytics(tenantId);
  }

  @Get('voice')
  @ApiOperation({ summary: 'Voice call analytics' })
  async getVoice(@TenantId() tenantId: string) {
    return await this.analyticsService.getVoiceAnalytics(tenantId);
  }

  @Get('whatsapp')
  @ApiOperation({ summary: 'WhatsApp message analytics' })
  async getWhatsapp(@TenantId() tenantId: string) {
    return await this.analyticsService.getWhatsappAnalytics(tenantId);
  }

  @Get('ai')
  @ApiOperation({ summary: 'AI usage analytics' })
  async getAiUsage(@TenantId() tenantId: string) {
    return await this.analyticsService.getAiUsageAnalytics(tenantId);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Weighted pipeline forecast' })
  async getForecast(@TenantId() tenantId: string, @Query('pipelineId') pipelineId?: string) {
    return await this.analyticsService.getForecastAnalytics(tenantId, pipelineId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get specific metrics' })
  async getMetrics(
    @TenantId() tenantId: string,
    @Query('name') name: string,
    @Query('period') period: string = 'DAILY',
  ) {
    return await this.analyticsService.getMetrics(tenantId, name, period);
  }

  @Get('roi')
  @ApiOperation({ summary: 'Campaign ROI analytics' })
  async getRoi(@TenantId() tenantId: string) {
    return await this.advancedAnalyticsService.getRoiReport(tenantId);
  }

  @Get('ai-vs-human')
  @ApiOperation({ summary: 'AI vs human agent performance comparison' })
  async getAiVsHuman(@TenantId() tenantId: string) {
    return await this.advancedAnalyticsService.getAiVsHumanReport(tenantId);
  }

  @Get('export-pdf')
  @ApiOperation({ summary: 'Export analytics report as PDF' })
  async exportPdf(
    @TenantId() tenantId: string,
    @Query('reportType') reportType: string,
    @Res() res: Response,
  ) {
    const buffer = await this.advancedAnalyticsService.exportReportPdf(
      tenantId,
      reportType ?? 'overview',
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report_${reportType ?? 'overview'}_${Date.now()}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
