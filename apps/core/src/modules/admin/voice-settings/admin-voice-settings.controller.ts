import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminVoiceSettingsService } from './admin-voice-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Voice Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/voice')
export class AdminVoiceSettingsController {
  constructor(private readonly voiceSettingsService: AdminVoiceSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global Voice/TTS settings' })
  async getSettings() {
    const data = await this.voiceSettingsService.getSettings();
    return { status: 200, message: 'Voice settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global Voice/TTS settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.voiceSettingsService.updateSettings(settings);
    return { status: 200, message: 'Voice settings updated', error: false, data };
  }
}
