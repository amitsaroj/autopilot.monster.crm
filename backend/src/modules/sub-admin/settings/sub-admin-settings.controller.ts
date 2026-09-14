import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminSettingsService } from './sub-admin-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Settings')
@ApiBearerAuth()
@ResourcePermissions('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/settings')
export class SubAdminSettingsController {
  constructor(private readonly settingsService: SubAdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current tenant settings' })
  async getSettings(@TenantId() tenantId: string) {
    return await this.settingsService.getSettings(tenantId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.settingsService.updateSettings(tenantId, dto);
  }
}
