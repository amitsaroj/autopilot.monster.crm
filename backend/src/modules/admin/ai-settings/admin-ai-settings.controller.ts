import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAISettingsService } from './admin-ai-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / AI Settings')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/ai')
export class AdminAISettingsController {
  constructor(private readonly aiSettingsService: AdminAISettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global AI/LLM settings' })
  async getSettings() {
    return await this.aiSettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global AI/LLM settings' })
  async updateSettings(@Body() settings: any) {
    return await this.aiSettingsService.updateSettings(settings);
  }
}
