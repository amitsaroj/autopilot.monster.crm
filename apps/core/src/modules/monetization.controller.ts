import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '../common/guards';
import { PricingService } from './pricing/pricing.service';
import { BillingService } from './billing/billing.service';
import { TenantId } from '../common/decorators';

@ApiTags('Monetization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('monetization')
export class MonetizationController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly billingService: BillingService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all available plans' })
  getPlans() {
    return this.pricingService.findAllPlans();
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription' })
  getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get billing history' })
  getInvoices(@TenantId() tenantId: string) {
    return this.billingService.getInvoices(tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current usage' })
  getUsage(@TenantId() tenantId: string) {
    // Basic metrics retrieval
    return this.billingService.getUsage(tenantId, 'all');
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade subscription' })
  upgrade(@TenantId() tenantId: string, @Body() dto: { planId: string }) {
      console.log(`Tenant ${tenantId} upgrading to ${dto.planId}`);
      return { message: 'Upgrade initiated', url: '#' };
  }

  @Post('portal')
  @ApiOperation({ summary: 'Get billing portal URL' })
  getPortal(@TenantId() tenantId: string) {
      console.log(`Tenant ${tenantId} accessing billing portal`);
      return { url: '#' };
  }
}
