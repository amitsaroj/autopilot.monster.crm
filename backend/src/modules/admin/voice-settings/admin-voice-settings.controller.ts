import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminVoiceSettingsService } from './admin-voice-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Voice Settings')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/voice')
export class AdminVoiceSettingsController {
  constructor(private readonly voiceSettingsService: AdminVoiceSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global Voice/TTS settings' })
  async getSettings() {
    return await this.voiceSettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global Voice/TTS settings' })
  async updateSettings(@Body() settings: any) {
    return await this.voiceSettingsService.updateSettings(settings);
  }
}
