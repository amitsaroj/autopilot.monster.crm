import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminEmailSettingsService } from './admin-email-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Email Settings')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/email')
export class AdminEmailSettingsController {
  constructor(private readonly emailSettingsService: AdminEmailSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global email/SMTP settings' })
  async getSettings() {
    return await this.emailSettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global email/SMTP settings' })
  async updateSettings(@Body() settings: any) {
    return await this.emailSettingsService.updateSettings(settings);
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test email to verify settings' })
  async testEmail(@Body() data: { to: string }) {
    return await this.emailSettingsService.sendTestEmail(data.to);
  }
}
