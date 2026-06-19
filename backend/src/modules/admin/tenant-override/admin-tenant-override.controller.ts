import { Controller, Get, Post, Delete, Body, UseGuards, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminTenantOverrideService } from './admin-tenant-override.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Tenant Overrides')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/tenants/:id/overrides')
export class AdminTenantOverrideController {
  constructor(private readonly overrideService: AdminTenantOverrideService) {}

  @Get()
  @ApiOperation({ summary: 'Get current overrides for a tenant' })
  async getOverrides(@Param('id') tenantId: string) {
    return this.overrideService.getOverrides(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Set overrides for a tenant' })
  async setOverrides(@Param('id') tenantId: string, @Body() overrides: any) {
    const data = await this.overrideService.setOverrides(tenantId, overrides);
    return data;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove all overrides for a tenant' })
  async removeOverrides(@Param('id') tenantId: string) {
    await this.overrideService.removeOverrides(tenantId);
  }
}
