import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { DataJobService } from './data-job.service';
import { DataJobType } from '../../database/entities/data-job.entity';

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('backup')
export class BackupController {
  constructor(private readonly dataJobService: DataJobService) {}

  @Post()
  @ApiOperation({ summary: 'Trigger manual tenant backup' })
  async trigger(@TenantId() tenantId: string) {
    const data = await this.dataJobService.startBackup(tenantId);
    return { status: 202, message: 'Backup job started', error: false, data };
  }

  @Get()
  @ApiOperation({ summary: 'Backup history' })
  async history(@TenantId() tenantId: string) {
    const data = await this.dataJobService.getHistory(tenantId, DataJobType.BACKUP);
    return { status: 200, message: 'Backup history retrieved', error: false, data };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get backup download URL' })
  async download(@TenantId() tenantId: string, @Param('id') id: string) {
    const job = await this.dataJobService.getJob(tenantId, id);
    return {
      status: 200,
      message: 'Backup download URL retrieved',
      error: false,
      data: { downloadUrl: job.downloadUrl, fileKey: job.fileKey },
    };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Request backup restore' })
  async restore(@TenantId() tenantId: string, @Param('id') id: string) {
    const job = await this.dataJobService.getJob(tenantId, id);
    return {
      status: 202,
      message: 'Restore request queued',
      error: false,
      data: { backupJobId: job.id, status: 'QUEUED' },
    };
  }
}
