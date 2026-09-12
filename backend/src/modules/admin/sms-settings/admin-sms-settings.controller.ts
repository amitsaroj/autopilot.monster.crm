import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSmsSettingsService } from './admin-sms-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / SMS Settings')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/sms')
export class AdminSmsSettingsController {
  constructor(private readonly smsSettingsService: AdminSmsSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global SMS/Twilio settings' })
  async getSettings() {
    return await this.smsSettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global SMS/Twilio settings' })
  async updateSettings(@Body() settings: any) {
    return await this.smsSettingsService.updateSettings(settings);
  }
}
