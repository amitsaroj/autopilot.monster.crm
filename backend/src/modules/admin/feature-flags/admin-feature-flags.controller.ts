import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeatureFlagsService } from './admin-feature-flags.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Feature Flags')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/feature-flags')
export class AdminFeatureFlagsController {
  constructor(private readonly adminFeatureFlagsService: AdminFeatureFlagsService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get all global feature flags' })
  async getGlobalFlags() {
    return await this.adminFeatureFlagsService.getGlobalFlags();
  }

  @Post('global')
  @ApiOperation({ summary: 'Update/Create a global feature flag' })
  async updateGlobalFlag(@Body() body: { key: string; enabled: boolean }) {
    return await this.adminFeatureFlagsService.updateGlobalFlag(body.key, body.enabled);
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get feature flags for a specific tenant' })
  async getTenantFlags(@Param('tenantId') tenantId: string) {
    return await this.adminFeatureFlagsService.getTenantFlags(tenantId);
  }

  @Patch('tenant/:tenantId')
  @ApiOperation({ summary: 'Override feature flag for a tenant' })
  async updateTenantFlag(
    @Param('tenantId') tenantId: string,
    @Body() body: { key: string; enabled: boolean },
  ) {
    return await this.adminFeatureFlagsService.updateTenantFlag(tenantId, body.key, body.enabled);
  }
}
