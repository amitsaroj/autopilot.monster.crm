import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminTenantOverrideService } from './admin-tenant-override.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Tenant Overrides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/tenants/:id/overrides')
export class AdminTenantOverrideController {
  constructor(private readonly overrideService: AdminTenantOverrideService) {}

  @Get()
  @ApiOperation({ summary: 'Get current overrides for a tenant' })
  async getOverrides(@Param('id') tenantId: string) {
    const data = await this.overrideService.getOverrides(tenantId);
    return { status: 200, message: 'Overrides retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Set overrides for a tenant' })
  async setOverrides(@Param('id') tenantId: string, @Body() overrides: any) {
    const data = await this.overrideService.setOverrides(tenantId, overrides);
    return { status: 200, message: 'Overrides saved', error: false, data };
  }
}
