import { Controller, Get, Post, Body, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard, RolesGuard } from '../common/guards';
import { PricingService } from './pricing/pricing.service';
import { BillingService } from './billing/billing.service';
import { TenantId, Roles } from '../common/decorators';

@ApiTags('Monetization')
@ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, TenantGuard)
  getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get billing history' })
  @UseGuards(JwtAuthGuard, TenantGuard)
  getInvoices(@TenantId() tenantId: string) {
    return this.billingService.getInvoices(tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current usage' })
  @UseGuards(JwtAuthGuard, TenantGuard)
  getUsage(@TenantId() tenantId: string) {
    // Basic metrics retrieval
    return this.billingService.getUsage(tenantId, 'all');
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade subscription' })
  @UseGuards(JwtAuthGuard, TenantGuard)
  upgrade(@TenantId() tenantId: string, @Body() dto: { planId: string }) {
    console.log(`Tenant ${tenantId} upgrading to ${dto.planId}`);
    return { message: 'Upgrade initiated', url: '#' };
  }

  @Post('portal')
  @ApiOperation({ summary: 'Get billing portal URL' })
  @UseGuards(JwtAuthGuard, TenantGuard)
  getPortal(@TenantId() tenantId: string) {
    console.log(`Tenant ${tenantId} accessing billing portal`);
    return { url: '#' };
  }

  // --- Management (SuperAdmin) ---

  @Post('admin/plans')
  @ApiOperation({ summary: 'Create a new plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  createPlan(@Body() data: any) {
    return this.pricingService.createPlan(data);
  }

  @Patch('admin/plans/:id')
  @ApiOperation({ summary: 'Update a plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updatePlan(@Param('id') id: string, @Body() data: any) {
    return this.pricingService.updatePlan(id, data);
  }

  @Delete('admin/plans/:id')
  @ApiOperation({ summary: 'Delete a plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  deletePlan(@Param('id') id: string) {
    return this.pricingService.deletePlan(id);
  }

  @Post('admin/plans/:id/features')
  @ApiOperation({ summary: 'Add feature to plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  addFeature(@Param('id') planId: string, @Body() data: any) {
    return this.pricingService.addFeatureToPlan({ ...data, planId });
  }

  @Patch('admin/features/:id')
  @ApiOperation({ summary: 'Update plan feature' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateFeature(@Param('id') id: string, @Body() data: any) {
    return this.pricingService.updatePlanFeature(id, data);
  }

  @Delete('admin/features/:id')
  @ApiOperation({ summary: 'Remove feature from plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  removeFeature(@Param('id') id: string) {
    return this.pricingService.removeFeatureFromPlan(id);
  }

  @Post('admin/plans/:id/limits')
  @ApiOperation({ summary: 'Add limit to plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  addLimit(@Param('id') planId: string, @Body() data: any) {
    return this.pricingService.addLimitToPlan({ ...data, planId });
  }

  @Patch('admin/limits/:id')
  @ApiOperation({ summary: 'Update plan limit' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateLimit(@Param('id') id: string, @Body() data: any) {
    return this.pricingService.updatePlanLimit(id, data);
  }

  @Delete('admin/limits/:id')
  @ApiOperation({ summary: 'Remove limit from plan' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  removeLimit(@Param('id') id: string) {
    return this.pricingService.removeLimitFromPlan(id);
  }

  // --- Billing & Usage (SuperAdmin) ---

  @Get('admin/invoices')
  @ApiOperation({ summary: 'Get all platform invoices' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllInvoices() {
    const data = await this.billingService.getAllInvoices();
    return {
      status: 200,
      message: 'Invoices retrieved',
      error: false,
      data,
    };
  }

  @Get('admin/subscriptions')
  @ApiOperation({ summary: 'Get all platform subscriptions' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllSubscriptions() {
    const data = await this.billingService.getAllSubscriptions();
    return {
      status: 200,
      message: 'Subscriptions retrieved',
      error: false,
      data,
    };
  }

  @Get('admin/usage')
  @ApiOperation({ summary: 'Get global usage metrics' })
  @Roles('SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getGlobalUsage() {
    const data = await this.billingService.getGlobalUsage();
    return {
      status: 200,
      message: 'Global usage retrieved',
      error: false,
      data,
    };
  }
}
