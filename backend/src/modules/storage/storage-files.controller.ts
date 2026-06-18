import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { StorageService } from './storage.service';
import { PresignedUploadDto } from '../data-jobs/dto/data-job.dto';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('storage/files')
export class StorageFilesController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  @ApiOperation({ summary: 'List tenant files' })
  async list(@TenantId() tenantId: string) {
    const data = await this.storageService.listFiles(tenantId);
    return { status: 200, message: 'Files retrieved', error: false, data };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  async presignedUpload(@TenantId() tenantId: string, @Body() dto: PresignedUploadDto) {
    const data = await this.storageService.createPresignedUpload(
      tenantId,
      dto.filename,
      dto.mimeType,
    );
    return { status: 200, message: 'Upload URL generated', error: false, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata' })
  async getFile(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.storageService.getFile(tenantId, id);
    return { status: 200, message: 'File retrieved', error: false, data };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get presigned download URL' })
  async download(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.storageService.getPresignedDownload(tenantId, id);
    return { status: 200, message: 'Download URL generated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  async delete(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.storageService.deleteFile(tenantId, id);
    return { status: 200, message: 'File deleted', error: false, data: null };
  }
}
