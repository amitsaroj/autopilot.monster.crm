import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSecuritySettingsService } from './admin-security-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Security Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/security')
export class AdminSecuritySettingsController {
  constructor(private readonly securitySettingsService: AdminSecuritySettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global security policies' })
  async getSettings() {
    const data = await this.securitySettingsService.getSettings();
    return { status: 200, message: 'Security settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global security policies' })
  async updateSettings(@Body() settings: any) {
    const data = await this.securitySettingsService.updateSettings(settings);
    return { status: 200, message: 'Security settings updated', error: false, data };
  }
}
