import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { AnalyticsDashboardService } from './analytics-dashboard.service';
import {
  CreateAnalyticsDashboardDto,
  UpdateAnalyticsDashboardDto,
} from './dto/analytics-dashboard.dto';

@ApiTags('Analytics Dashboards')
@ResourcePermissions('analytics')
@PlanFeature('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics/dashboards')
export class AnalyticsDashboardsController {
  constructor(private readonly dashboardService: AnalyticsDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'List saved dashboards' })
  async list(@TenantId() tenantId: string) {
    return await this.dashboardService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create dashboard' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAnalyticsDashboardDto) {
    return await this.dashboardService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.dashboardService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dashboard' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnalyticsDashboardDto,
  ) {
    return await this.dashboardService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dashboard' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.dashboardService.remove(tenantId, id);
    return null;
  }
}
