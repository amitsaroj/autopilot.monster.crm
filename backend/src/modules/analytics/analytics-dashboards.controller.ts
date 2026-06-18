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
import { AnalyticsDashboardService } from './analytics-dashboard.service';
import {
  CreateAnalyticsDashboardDto,
  UpdateAnalyticsDashboardDto,
} from './dto/analytics-dashboard.dto';

@ApiTags('Analytics Dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics/dashboards')
export class AnalyticsDashboardsController {
  constructor(private readonly dashboardService: AnalyticsDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'List saved dashboards' })
  async list(@TenantId() tenantId: string) {
    const data = await this.dashboardService.findAll(tenantId);
    return { status: 200, message: 'Dashboards retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create dashboard' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateAnalyticsDashboardDto) {
    const data = await this.dashboardService.create(tenantId, dto);
    return { status: 201, message: 'Dashboard created', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard detail' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.dashboardService.findOne(tenantId, id);
    return { status: 200, message: 'Dashboard retrieved', error: false, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dashboard' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAnalyticsDashboardDto,
  ) {
    const data = await this.dashboardService.update(tenantId, id, dto);
    return { status: 200, message: 'Dashboard updated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dashboard' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.dashboardService.remove(tenantId, id);
    return { status: 200, message: 'Dashboard deleted', error: false, data: null };
  }
}
