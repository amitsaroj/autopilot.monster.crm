import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantSettingsService } from './tenant-settings.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Admin / Tenants / Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('admin/tenants/:tenantId/settings')
export class AdminTenantSettingsController {
  constructor(private readonly service: TenantSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all integration settings for a specific tenant' })
  async findAll(@Param('tenantId') tenantId: string) {
    const data = await this.service.findAll(tenantId);
    return { status: 200, message: 'Tenant settings retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update or create an integration setting for a tenant' })
  async update(
    @Param('tenantId') tenantId: string,
    @Body() data: { key: string; value: any; group?: string },
  ) {
    const result = await this.service.updateSetting(tenantId, data);
    return { status: 200, message: 'Tenant setting updated', error: false, data: result };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Remove a tenant-specific integration override' })
  async remove(@Param('tenantId') tenantId: string, @Param('key') key: string) {
    await this.service.removeSetting(tenantId, key);
    return { status: 200, message: 'Tenant override removed', error: false, data: null };
  }
}
