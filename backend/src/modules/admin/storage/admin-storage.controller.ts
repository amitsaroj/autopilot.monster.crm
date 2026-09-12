import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminStorageService } from './admin-storage.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Storage Monitoring')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/storage')
export class AdminStorageController {
  constructor(private readonly storageService: AdminStorageService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get global storage statistics' })
  async getStorageStats() {
    return await this.storageService.getStats();
  }
}
