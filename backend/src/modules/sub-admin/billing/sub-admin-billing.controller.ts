import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminBillingService } from './sub-admin-billing.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Billing')
@ApiBearerAuth()
@ResourcePermissions('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/billing')
export class SubAdminBillingController {
  constructor(private readonly billingService: SubAdminBillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  async getSubscription(@TenantId() tenantId: string) {
    return await this.billingService.getSubscription(tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get tenant invoices' })
  async getInvoices(@TenantId() tenantId: string) {
    return await this.billingService.getInvoices(tenantId);
  }
}
