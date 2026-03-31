import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminEmailSettingsService } from './admin-email-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Email Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/email')
export class AdminEmailSettingsController {
  constructor(private readonly emailSettingsService: AdminEmailSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global email/SMTP settings' })
  async getSettings() {
    const data = await this.emailSettingsService.getSettings();
    return { status: 200, message: 'Email settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global email/SMTP settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.emailSettingsService.updateSettings(settings);
    return { status: 200, message: 'Email settings updated', error: false, data };
  }

  @Post('test')
  @ApiOperation({ summary: 'Send a test email to verify settings' })
  async testEmail(@Body() data: { to: string }) {
    const result = await this.emailSettingsService.sendTestEmail(data.to);
    return { status: 200, message: 'Test email sent', error: false, data: result };
  }
}
