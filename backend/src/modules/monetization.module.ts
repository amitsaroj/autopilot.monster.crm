import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing/pricing.service';
import { PricingRepository } from './pricing/pricing.repository';
import { BillingService } from './billing/billing.service';
import { WalletService } from './billing/wallet.service';
import { CouponService } from './billing/coupon.service';
import { PaypalService } from './billing/paypal.service';
import { RazorpayService } from './billing/razorpay.service';
import { BillingExtController } from './billing/billing-ext.controller';
import { Plan } from '../database/entities/plan.entity';
import { PlanFeature } from '../database/entities/plan-feature.entity';
import { PlanLimit } from '../database/entities/plan-limit.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { Payment } from '../database/entities/payment.entity';
import { UsageRecord } from '../database/entities/usage-record.entity';
import { Wallet, WalletTransaction } from '../database/entities/wallet.entity';
import { Coupon } from '../database/entities/coupon.entity';

import { MonetizationController } from './monetization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      PlanFeature,
      PlanLimit,
      Subscription,
      Invoice,
      Payment,
      UsageRecord,
      Wallet,
      WalletTransaction,
      Coupon,
    ]),
  ],
  controllers: [MonetizationController, BillingExtController],
  providers: [PricingService, PricingRepository, BillingService, WalletService, CouponService, PaypalService, RazorpayService],
  exports: [PricingService, BillingService, WalletService, CouponService, PaypalService, RazorpayService],
})
export class MonetizationModule {}
