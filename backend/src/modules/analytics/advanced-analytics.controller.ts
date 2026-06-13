import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { Response } from 'express';

@ApiTags('Analytics - Advanced')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics')
export class AdvancedAnalyticsController {
  constructor(private readonly analyticsService: AdvancedAnalyticsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async revenue(
    @TenantId() tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getRevenueSummary(tenantId, startDate, endDate);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get pipeline analytics' })
  async pipeline(@TenantId() tenantId: string) {
    return this.analyticsService.getPipelineAnalytics(tenantId);
  }

  @Get('crm/overview')
  @ApiOperation({ summary: 'Get CRM overview metrics' })
  async crmOverview(@TenantId() tenantId: string) {
    return this.analyticsService.getCrmOverview(tenantId);
  }

  @Get('voice')
  @ApiOperation({ summary: 'Get voice call analytics' })
  async voice(
    @TenantId() tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getVoiceAnalytics(tenantId, startDate, endDate);
  }

  @Get('team-performance')
  @ApiOperation({ summary: 'Get team performance analytics' })
  async teamPerformance(@TenantId() tenantId: string) {
    return this.analyticsService.getTeamPerformance(tenantId);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get revenue forecast' })
  async forecast(@TenantId() tenantId: string) {
    return this.analyticsService.getForecast(tenantId);
  }

  @Get('custom-report')
  @ApiOperation({ summary: 'Build a custom report based on config' })
  async customReport(@TenantId() tenantId: string, @Query('config') config: string) {
    let parsedConfig = {};
    try { if (config) parsedConfig = JSON.parse(config); } catch (e) {}
    return this.analyticsService.buildCustomReport(tenantId, parsedConfig);
  }

  @Get('widgets')
  @ApiOperation({ summary: 'Get dashboard widgets layout' })
  async widgets(@TenantId() tenantId: string) {
    return this.analyticsService.getDashboardWidgets(tenantId);
  }

  @Get('schedule-report')
  @ApiOperation({ summary: 'Schedule an automated report' })
  async scheduleReport(@TenantId() tenantId: string, @Query('config') config: string) {
    let parsedConfig = {};
    try { if (config) parsedConfig = JSON.parse(config); } catch (e) {}
    return this.analyticsService.scheduleReport(tenantId, parsedConfig);
  }

  @Get('roi')
  @ApiOperation({ summary: 'Get Campaign Return on Investment (ROI) analytics' })
  async getRoi(@TenantId() tenantId: string) {
    return this.analyticsService.getRoiReport(tenantId);
  }

  @Get('ai-vs-human')
  @ApiOperation({ summary: 'Get AI voice agents vs Human agent performance comparison' })
  async getAiVsHuman(@TenantId() tenantId: string) {
    return this.analyticsService.getAiVsHumanReport(tenantId);
  }

  @Get('export-pdf')
  @ApiOperation({ summary: 'Export sales or campaign reports as PDF binary stream' })
  async exportPdf(
    @TenantId() tenantId: string,
    @Query('reportType') reportType: string,
    @Res() res: Response,
  ) {
    const buffer = await this.analyticsService.exportReportPdf(tenantId, reportType);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report_${reportType}_${Date.now()}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
