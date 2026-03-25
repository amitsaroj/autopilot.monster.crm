import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminBackupsService } from './admin-backups.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Platform Backups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/backups')
export class AdminBackupsController {
  constructor(private readonly backupsService: AdminBackupsService) {}

  @Get()
  @ApiOperation({ summary: 'List all platform backups' })
  async findAll() {
    const data = await this.backupsService.findAll();
    return { status: 200, message: 'Backups retrieved', error: false, data };
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger a new platform-wide backup' })
  async trigger() {
    const data = await this.backupsService.trigger();
    return { status: 201, message: 'Backup initiated', error: false, data };
  }
}
