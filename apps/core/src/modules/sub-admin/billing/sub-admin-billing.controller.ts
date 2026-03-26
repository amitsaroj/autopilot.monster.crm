import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminBillingService } from './sub-admin-billing.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/billing')
export class SubAdminBillingController {
  constructor(private readonly billingService: SubAdminBillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  async getSubscription(@TenantId() tenantId: string) {
    const data = await this.billingService.getSubscription(tenantId);
    return { status: 200, message: 'Subscription details retrieved', error: false, data };
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get tenant invoices' })
  async getInvoices(@TenantId() tenantId: string) {
    const data = await this.billingService.getInvoices(tenantId);
    return { status: 200, message: 'Invoice history retrieved', error: false, data };
  }
}
