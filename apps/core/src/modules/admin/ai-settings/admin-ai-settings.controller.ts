import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAISettingsService } from './admin-ai-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / AI Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/ai')
export class AdminAISettingsController {
  constructor(private readonly aiSettingsService: AdminAISettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global AI/LLM settings' })
  async getSettings() {
    const data = await this.aiSettingsService.getSettings();
    return { status: 200, message: 'AI settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global AI/LLM settings' })
  async updateSettings(@Body() settings: any) {
    const data = await this.aiSettingsService.updateSettings(settings);
    return { status: 200, message: 'AI settings updated', error: false, data };
  }
}
