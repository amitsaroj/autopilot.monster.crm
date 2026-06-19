import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature } from '../../common/decorators';
import { DataJobService } from './data-job.service';
import { StartImportDto } from './dto/data-job.dto';
import { DataJobType } from '../../database/entities/data-job.entity';

@ApiTags('Import')
@ResourcePermissions('data-jobs')
@PlanFeature('import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly dataJobService: DataJobService) {}

  @Post()
  @ApiOperation({ summary: 'Start import job' })
  async start(@TenantId() tenantId: string, @Body() dto: StartImportDto) {
    const data = await this.dataJobService.startImport(tenantId, dto);
    return { status: 202, message: 'Import job started', error: false, data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Import job history' })
  async history(@TenantId() tenantId: string) {
    const data = await this.dataJobService.getHistory(tenantId, DataJobType.IMPORT);
    return { status: 200, message: 'Import history retrieved', error: false, data };
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Import job status' })
  async status(@TenantId() tenantId: string, @Param('jobId') jobId: string) {
    const data = await this.dataJobService.getJob(tenantId, jobId);
    return { status: 200, message: 'Import job retrieved', error: false, data };
  }
}
