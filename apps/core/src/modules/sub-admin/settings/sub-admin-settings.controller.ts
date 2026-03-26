import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminSettingsService } from './sub-admin-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/settings')
export class SubAdminSettingsController {
  constructor(private readonly settingsService: SubAdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current tenant settings' })
  async getSettings(@TenantId() tenantId: string) {
    const data = await this.settingsService.getSettings(tenantId);
    return { status: 200, message: 'Tenant profile synchronized', error: false, data };
  }

  @Patch()
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.settingsService.updateSettings(tenantId, dto);
    return { status: 200, message: 'Tenant manifold updated', error: false, data };
  }
}
