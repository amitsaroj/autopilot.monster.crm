import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSystemSettingsService } from './admin-system-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/system')
export class AdminSystemSettingsController {
  constructor(private readonly settingsService: AdminSystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return { status: 200, message: 'System settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.settingsService.updateSettings(settings);
    return { status: 200, message: 'System settings updated', error: false, data };
  }
}
