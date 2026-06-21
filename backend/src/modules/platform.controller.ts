import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '../common/guards';
import { TenantId, ResourcePermissions } from '../common/decorators';
import { PricingService } from './pricing/pricing.service';
import { BillingService } from './billing/billing.service';

@ApiTags('Platform')
@ApiBearerAuth()
@ResourcePermissions('platform')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller()
export class PlatformController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly billingService: BillingService,
  ) {}

  @Get('usage')
  @ApiOperation({ summary: 'Get current tenant usage' })
  async getUsage(@TenantId() tenantId: string) {
    return this.billingService.getUsageBreakdown(tenantId);
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get current tenant limits' })
  async getLimits(@TenantId() tenantId: string) {
    return this.pricingService.getAllLimits(tenantId);
  }

  @Get('features')
  @ApiOperation({ summary: 'Get enabled features for tenant' })
  async getFeatures(@TenantId() tenantId: string) {
    return this.pricingService.getEnabledFeatures(tenantId);
  }
}
