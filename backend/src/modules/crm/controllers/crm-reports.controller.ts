import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AnalyticsCrmService } from '../crm-support.service';

@ApiTags('CRM Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('crm/reports')
export class CrmReportsController {
  constructor(private readonly analyticsService: AnalyticsCrmService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get CRM high-level objective vectors' })
  async getSummary(@Request() req: any) {
    return this.analyticsService.getSummary(req.user.tenantId);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get Pipeline stage historical distribution' })
  async getPipeline(@Request() req: any) {
    return this.analyticsService.getPipelineData(req.user.tenantId);
  }

  @Get('revenue-trend')
  @ApiOperation({ summary: 'Get Monthly Revenue Conversion Trend' })
  @Roles('admin', 'superadmin')
  async getRevenueTrend(@Request() req: any) {
    return this.analyticsService.getRevenueTrend(req.user.tenantId);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get Agent/Owner Performance Leaderboard' })
  @Roles('admin', 'superadmin')
  async getPerformance(@Request() req: any) {
    return this.analyticsService.getAgentPerformance(req.user.tenantId);
  }

  @Get('lead-funnel')
  @ApiOperation({ summary: 'Get Lead-to-Contact conversion velocity' })
  async getLeadFunnel(@Request() req: any) {
    return this.analyticsService.getLeadFunnels(req.user.tenantId);
  }
}
