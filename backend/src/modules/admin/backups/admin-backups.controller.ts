import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminBackupsService } from './admin-backups.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Platform Backups')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/backups')
export class AdminBackupsController {
  constructor(private readonly backupsService: AdminBackupsService) {}

  @Get()
  @ApiOperation({ summary: 'List all platform backups' })
  async findAll() {
    return await this.backupsService.findAll();
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger a new platform-wide backup' })
  async trigger() {
    return await this.backupsService.trigger();
  }
}
