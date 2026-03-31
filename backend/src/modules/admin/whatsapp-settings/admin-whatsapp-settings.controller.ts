import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminWhatsAppSettingsService } from './admin-whatsapp-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / WhatsApp Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/whatsapp')
export class AdminWhatsAppSettingsController {
  constructor(private readonly whatsappSettingsService: AdminWhatsAppSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global WhatsApp Business settings' })
  async getSettings() {
    const data = await this.whatsappSettingsService.getSettings();
    return { status: 200, message: 'WhatsApp settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global WhatsApp Business settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.whatsappSettingsService.updateSettings(settings);
    return { status: 200, message: 'WhatsApp settings updated', error: false, data };
  }
}
