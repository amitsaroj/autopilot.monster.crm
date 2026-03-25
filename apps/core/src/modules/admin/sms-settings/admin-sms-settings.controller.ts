import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSmsSettingsService } from './admin-sms-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / SMS Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/sms')
export class AdminSmsSettingsController {
  constructor(private readonly smsSettingsService: AdminSmsSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global SMS/Twilio settings' })
  async getSettings() {
    const data = await this.smsSettingsService.getSettings();
    return { status: 200, message: 'SMS settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global SMS/Twilio settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.smsSettingsService.updateSettings(settings);
    return { status: 200, message: 'SMS settings updated', error: false, data };
  }
}
