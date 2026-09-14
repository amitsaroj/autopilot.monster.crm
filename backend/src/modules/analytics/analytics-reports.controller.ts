import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { AnalyticsReportService } from './analytics-report.service';
import { CreateAnalyticsReportDto, UpdateAnalyticsReportDto } from './dto/analytics-report.dto';

@ApiTags('Analytics Reports')
@ResourcePermissions('analytics')
@PlanFeature('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics/reports')
export class AnalyticsReportsController {
  constructor(private readonly reportService: AnalyticsReportService) {}

  @Get()
  @ApiOperation({ summary: 'List saved reports' })
  async list(@TenantId() tenantId: string) {
    return await this.reportService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create report' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAnalyticsReportDto) {
    return await this.reportService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.reportService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnalyticsReportDto,
  ) {
    return await this.reportService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.reportService.remove(tenantId, id);
    return null;
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run report and store results' })
  async run(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.reportService.run(tenantId, id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get last report results' })
  async results(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.reportService.getResults(tenantId, id);
  }
}
