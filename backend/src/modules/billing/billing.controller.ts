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

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { PricingService } from '../pricing/pricing.service';
import { AttachPaymentMethodDto, UpgradeSubscriptionDto, DowngradeSubscriptionDto, CancelSubscriptionDto } from './dto/billing.dto';
import { AddWalletCreditsDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Billing')
@ResourcePermissions('billing')
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
    const data = await this.billingService.downgradeSubscription(tenantId, dto.planId);
    return { status: 200, message: 'Subscription downgraded', error: false, data };
  }

  @Post('subscription/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(@TenantId() tenantId: string, @Body() dto: CancelSubscriptionDto) {
    const data = await this.billingService.cancelSubscription(tenantId, dto.atPeriodEnd ?? true);
    return { status: 200, message: 'Subscription cancelled', error: false, data };
  }

  @Post('subscription/reactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Reactivate cancelled subscription' })
  async reactivate(@TenantId() tenantId: string) {
    const data = await this.billingService.reactivateSubscription(tenantId);
    return { status: 200, message: 'Subscription reactivated', error: false, data };
  }

  @Get('invoices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get billing history' })
  getInvoices(@TenantId() tenantId: string) {
    return this.billingService.getInvoices(tenantId);
  }

  @Get('usage')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get current usage' })
  getUsage(@TenantId() tenantId: string) {
    return this.billingService.getUsage(tenantId, 'all');
  }

  @Get('payment-methods')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'List payment methods' })
  async listPaymentMethods(@TenantId() tenantId: string) {
    const data = await this.billingService.listPaymentMethods(tenantId);
    return { status: 200, message: 'Payment methods retrieved', error: false, data };
  }

  @Post('payment-methods')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Create Stripe setup intent for adding a card' })
  async createSetupIntent(@TenantId() tenantId: string) {
    const data = await this.billingService.createSetupIntent(tenantId);
    return { status: 201, message: 'Setup intent created', error: false, data };
  }

  @Post('payment-methods/attach')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Attach a payment method after setup intent confirmation' })
  async attachPaymentMethod(@TenantId() tenantId: string, @Body() dto: AttachPaymentMethodDto) {
    const data = await this.billingService.attachPaymentMethod(
      tenantId,
      dto.paymentMethodId,
      dto.setDefault ?? false,
    );
    return { status: 201, message: 'Payment method attached', error: false, data };
  }

  @Delete('payment-methods/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Remove payment method' })
  async removePaymentMethod(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.billingService.removePaymentMethod(tenantId, id);
    return { status: 200, message: 'Payment method removed', error: false, data: null };
  }

  @Patch('payment-methods/:id/default')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Set default payment method' })
  async setDefaultPaymentMethod(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.billingService.setDefaultPaymentMethod(tenantId, id);
    return { status: 200, message: 'Default payment method updated', error: false, data };
  }

  @Get('wallet')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get wallet balance' })
  async getWallet(@TenantId() tenantId: string) {
    const data = await this.walletService.getWallet(tenantId);
    return { status: 200, message: 'Wallet retrieved', error: false, data };
  }

  @Get('wallet/transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Get wallet transaction history' })
  async getWalletTransactions(@TenantId() tenantId: string) {
    const data = await this.walletService.getTransactions(tenantId);
    return { status: 200, message: 'Wallet transactions retrieved', error: false, data };
  }

  @Post('wallet/credits')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Add credits to wallet' })
  async addWalletCredits(@TenantId() tenantId: string, @Body() dto: AddWalletCreditsDto) {
    const data = await this.walletService.addCredits(tenantId, dto);
    return { status: 201, message: 'Credits added', error: false, data };
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
    return this.billingService.handleWebhook(signature, req.rawBody as Buffer);
  }
}
