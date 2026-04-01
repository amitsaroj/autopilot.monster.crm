import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeatureFlagsService } from './admin-feature-flags.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Feature Flags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/feature-flags')
export class AdminFeatureFlagsController {
  constructor(private readonly adminFeatureFlagsService: AdminFeatureFlagsService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get all global feature flags' })
  async getGlobalFlags() {
    const data = await this.adminFeatureFlagsService.getGlobalFlags();
    return {
      status: 200,
      message: 'Global feature flags retrieved',
      error: false,
      data,
    };
  }

  @Post('global')
  @ApiOperation({ summary: 'Update/Create a global feature flag' })
  async updateGlobalFlag(@Body() body: { key: string; enabled: boolean }) {
    const data = await this.adminFeatureFlagsService.updateGlobalFlag(body.key, body.enabled);
    return {
      status: 200,
      message: 'Global feature flag updated',
      error: false,
      data,
    };
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get feature flags for a specific tenant' })
  async getTenantFlags(@Param('tenantId') tenantId: string) {
    const data = await this.adminFeatureFlagsService.getTenantFlags(tenantId);
    return {
      status: 200,
      message: 'Tenant feature flags retrieved',
      error: false,
      data,
    };
  }

  @Patch('tenant/:tenantId')
  @ApiOperation({ summary: 'Override feature flag for a tenant' })
  async updateTenantFlag(
    @Param('tenantId') tenantId: string,
    @Body() body: { key: string; enabled: boolean },
  ) {
    const data = await this.adminFeatureFlagsService.updateTenantFlag(
      tenantId,
      body.key,
      body.enabled,
    );
    return {
      status: 200,
      message: 'Tenant feature flag updated',
      error: false,
      data,
    };
  }
}
