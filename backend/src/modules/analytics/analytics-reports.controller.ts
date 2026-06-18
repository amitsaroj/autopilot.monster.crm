import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { AnalyticsReportService } from './analytics-report.service';
import {
  CreateAnalyticsReportDto,
  UpdateAnalyticsReportDto,
} from './dto/analytics-report.dto';

@ApiTags('Analytics Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics/reports')
export class AnalyticsReportsController {
  constructor(private readonly reportService: AnalyticsReportService) {}

  @Get()
  @ApiOperation({ summary: 'List saved reports' })
  async list(@TenantId() tenantId: string) {
    const data = await this.reportService.findAll(tenantId);
    return { status: 200, message: 'Reports retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create report' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAnalyticsReportDto) {
    const data = await this.reportService.create(tenantId, dto);
    return { status: 201, message: 'Report created', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.reportService.findOne(tenantId, id);
    return { status: 200, message: 'Report retrieved', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnalyticsReportDto,
  ) {
    const data = await this.reportService.update(tenantId, id, dto);
    return { status: 200, message: 'Report updated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.reportService.remove(tenantId, id);
    return { status: 200, message: 'Report deleted', error: false, data: null };
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run report and store results' })
  async run(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.reportService.run(tenantId, id);
    return { status: 200, message: 'Report executed', error: false, data };
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get last report results' })
  async results(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.reportService.getResults(tenantId, id);
    return { status: 200, message: 'Report results retrieved', error: false, data };
  }
}
