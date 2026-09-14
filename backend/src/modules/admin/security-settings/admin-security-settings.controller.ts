import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSecuritySettingsService } from './admin-security-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Security Settings')
@ResourcePermissions('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/security')
export class AdminSecuritySettingsController {
  constructor(private readonly securitySettingsService: AdminSecuritySettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global security policies' })
  async getSettings() {
    return await this.securitySettingsService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global security policies' })
  async updateSettings(@Body() settings: any) {
    return await this.securitySettingsService.updateSettings(settings);
  }
}
