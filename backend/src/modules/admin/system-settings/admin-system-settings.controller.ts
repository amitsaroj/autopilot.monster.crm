import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSystemSettingsService } from './admin-system-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / System Settings')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/system')
export class AdminSystemSettingsController {
  constructor(private readonly settingsService: AdminSystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  async getSettings() {
    return await this.settingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(@Body() settings: any) {
    return await this.settingsService.updateSettings(settings);
  }
}
