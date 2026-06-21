import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { DataJobService } from './data-job.service';
import { StartExportDto } from './dto/data-job.dto';
import { DataJobType } from '../../database/entities/data-job.entity';

@ApiTags('Export')
@ResourcePermissions('data-jobs')
@PlanFeature('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly dataJobService: DataJobService) {}

  @Post()
  @ApiOperation({ summary: 'Start export job' })
  async start(@TenantId() tenantId: string, @Body() dto: StartExportDto) {
    const data = await this.dataJobService.startExport(tenantId, dto);
    return { status: 202, message: 'Export job started', error: false, data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Export job history' })
  async history(@TenantId() tenantId: string) {
    const data = await this.dataJobService.getHistory(tenantId, DataJobType.EXPORT);
    return { status: 200, message: 'Export history retrieved', error: false, data };
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Export job status and download URL' })
  async status(@TenantId() tenantId: string, @Param('jobId') jobId: string) {
    const data = await this.dataJobService.getJob(tenantId, jobId);
    return { status: 200, message: 'Export job retrieved', error: false, data };
  }
}
