import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminWhatsAppSettingsService } from './admin-whatsapp-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / WhatsApp Settings')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/whatsapp')
export class AdminWhatsAppSettingsController {
  constructor(private readonly whatsappSettingsService: AdminWhatsAppSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global WhatsApp Business settings' })
  async getSettings() {
    return await this.whatsappSettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global WhatsApp Business settings' })
  async updateSettings(@Body() settings: any) {
    return await this.whatsappSettingsService.updateSettings(settings);
  }
}
