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
    return await this.dataJobService.startImport(tenantId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Import job history' })
  async history(@TenantId() tenantId: string) {
    return await this.dataJobService.getHistory(tenantId, DataJobType.IMPORT);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Import job status' })
  async status(@TenantId() tenantId: string, @Param('jobId') jobId: string) {
    return await this.dataJobService.getJob(tenantId, jobId);
  }
}
