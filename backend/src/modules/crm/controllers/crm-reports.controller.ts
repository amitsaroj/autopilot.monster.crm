import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles, TenantId } from '../../../common/decorators';
import { AnalyticsCrmService } from '../crm-support.service';

@ApiTags('CRM Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('crm/reports')
export class CrmReportsController {
  constructor(private readonly analyticsService: AnalyticsCrmService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get CRM high-level objective vectors' })
  async getSummary(@TenantId() tenantId: string) {
    return this.analyticsService.getSummary(tenantId);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get Pipeline stage historical distribution' })
  async getPipeline(@TenantId() tenantId: string) {
    return this.analyticsService.getPipelineData(tenantId);
  }

  @Get('revenue-trend')
  @ApiOperation({ summary: 'Get Monthly Revenue Conversion Trend' })
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  async getRevenueTrend(@TenantId() tenantId: string) {
    return this.analyticsService.getRevenueTrend(tenantId);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get Agent/Owner Performance Leaderboard' })
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  async getPerformance(@TenantId() tenantId: string) {
    return this.analyticsService.getAgentPerformance(tenantId);
  }

  @Get('lead-funnel')
  @ApiOperation({ summary: 'Get Lead-to-Contact conversion velocity' })
  async getLeadFunnel(@TenantId() tenantId: string) {
    return this.analyticsService.getLeadFunnels(tenantId);
  }
}
