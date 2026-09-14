import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Patch,
  Param,
  UseGuards,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard, TenantGuard, RolesGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, PlanFeature, Roles } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { PricingService } from '../pricing/pricing.service';
import {
  AttachPaymentMethodDto,
  UpgradeSubscriptionDto,
  DowngradeSubscriptionDto,
  CancelSubscriptionDto,
} from './dto/billing.dto';
import { AddWalletCreditsDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Billing')
@ResourcePermissions('billing')
@PlanFeature('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly pricingService: PricingService,
    private readonly walletService: WalletService,
  ) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get all public plans' })
  getPlans() {
    return this.pricingService.findAllPlans();
  }

  @Get('subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get current subscription' })
  getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Get('subscription/recovery')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get failed-payment recovery state' })
  async getRecoveryState(@TenantId() tenantId: string) {
    return await this.billingService.getBillingRecovery(tenantId);
  }

  @Post('subscription/upgrade')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Upgrade subscription' })
  upgrade(@TenantId() tenantId: string, @Body() dto: UpgradeSubscriptionDto) {
    return this.billingService.createCheckoutSession(tenantId, dto.planId, dto.billingCycle);
  }

  @Post('subscription/downgrade')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Downgrade subscription' })
  async downgrade(@TenantId() tenantId: string, @Body() dto: DowngradeSubscriptionDto) {
    return await this.billingService.downgradeSubscription(tenantId, dto.planId);
  }

  @Post('subscription/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(@TenantId() tenantId: string, @Body() dto: CancelSubscriptionDto) {
    return await this.billingService.cancelSubscription(tenantId, dto.atPeriodEnd ?? true);
  }

  @Post('subscription/reactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Reactivate cancelled subscription' })
  async reactivate(@TenantId() tenantId: string) {
    return await this.billingService.reactivateSubscription(tenantId);
  }

  @Post('subscription/retry-payment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Create retry payment recovery session' })
  async retryPayment(@TenantId() tenantId: string) {
    return await this.billingService.retryFailedPayment(tenantId);
  }

  @Get('invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get billing history' })
  getInvoices(@TenantId() tenantId: string) {
    return this.billingService.getInvoices(tenantId);
  }

  @Get('invoices/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get invoice by id' })
  async getInvoice(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.billingService.getInvoice(tenantId, id);
  }

  @Get('usage')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get current usage' })
  getUsage(@TenantId() tenantId: string) {
    return this.billingService.getUsageBreakdown(tenantId);
  }

  @Get('payment-methods')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'List payment methods' })
  async listPaymentMethods(@TenantId() tenantId: string) {
    return await this.billingService.listPaymentMethods(tenantId);
  }

  @Post('payment-methods')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Create Stripe setup intent for adding a card' })
  async createSetupIntent(@TenantId() tenantId: string) {
    return await this.billingService.createSetupIntent(tenantId);
  }

  @Post('payment-methods/attach')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Attach a payment method after setup intent confirmation' })
  async attachPaymentMethod(@TenantId() tenantId: string, @Body() dto: AttachPaymentMethodDto) {
    return await this.billingService.attachPaymentMethod(
      tenantId,
      dto.paymentMethodId,
      dto.setDefault ?? false,
    );
  }

  @Delete('payment-methods/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Remove payment method' })
  async removePaymentMethod(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.billingService.removePaymentMethod(tenantId, id);
    return null;
  }

  @Patch('payment-methods/:id/default')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Set default payment method' })
  async setDefaultPaymentMethod(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.billingService.setDefaultPaymentMethod(tenantId, id);
  }

  @Get('wallet')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get wallet balance' })
  async getWallet(@TenantId() tenantId: string) {
    return await this.walletService.getWallet(tenantId);
  }

  @Get('wallet/transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get wallet transaction history' })
  async getWalletTransactions(@TenantId() tenantId: string) {
    return await this.walletService.getTransactions(tenantId);
  }

  @Post('wallet/credits')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Add credits to wallet (admin only)' })
  async addWalletCredits(@TenantId() tenantId: string, @Body() dto: AddWalletCreditsDto) {
    return await this.walletService.addCredits(tenantId, dto);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }
    if (!req.rawBody?.length) {
      throw new BadRequestException('Missing request body');
    }
    return this.billingService.handleWebhook(signature, req.rawBody);
  }
}
