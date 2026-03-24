import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '../common/guards';
import { TenantId } from '../common/decorators';

@ApiTags('Platform')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller()
export class PlatformController {
  @Get('usage')
  @ApiOperation({ summary: 'Get current tenant usage' })
  getUsage(@TenantId() tenantId: string) {
    return { tenantId, usage: {} };
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get current tenant limits' })
  getLimits(@TenantId() tenantId: string) {
    return { tenantId, limits: {} };
  }

  @Get('features')
  @ApiOperation({ summary: 'Get enabled features for tenant' })
  getFeatures(@TenantId() tenantId: string) {
    return { tenantId, features: [] };
  }
}
