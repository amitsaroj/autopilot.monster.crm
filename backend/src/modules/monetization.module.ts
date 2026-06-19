import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing/pricing.service';
import { PricingRepository } from './pricing/pricing.repository';
import { BillingService } from './billing/billing.service';
import { BillingController } from './billing/billing.controller';
import { Plan } from '../database/entities/plan.entity';
import { PlanFeature } from '../database/entities/plan-feature.entity';
import { PlanLimit } from '../database/entities/plan-limit.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { Payment } from '../database/entities/payment.entity';
import { PaymentMethod } from '../database/entities/payment-method.entity';
import { UsageRecord } from '../database/entities/usage-record.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { WalletTransaction } from '../database/entities/wallet-transaction.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { WalletService } from './billing/wallet.service';
import { PlatformSetting } from '../database/entities/platform-setting.entity';

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
      PaymentMethod,
      UsageRecord,
      Wallet,
      WalletTransaction,
      Tenant,
      PlatformSetting,
    ]),
  ],
  controllers: [MonetizationController, BillingController],
  providers: [PricingService, PricingRepository, BillingService, WalletService],
  exports: [PricingService, BillingService, WalletService],
})
export class MonetizationModule {}
