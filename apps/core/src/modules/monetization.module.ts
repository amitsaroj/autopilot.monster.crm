import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingService } from './pricing/pricing.service';
import { PricingRepository } from './pricing/pricing.repository';
import { BillingService } from './billing/billing.service';
import { Plan } from '../database/entities/plan.entity';
import { PlanFeature } from '../database/entities/plan-feature.entity';
import { PlanLimit } from '../database/entities/plan-limit.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { Payment } from '../database/entities/payment.entity';
import { UsageRecord } from '../database/entities/usage-record.entity';

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
    ]),
  ],
  controllers: [MonetizationController],
  providers: [PricingService, PricingRepository, BillingService],
  exports: [PricingService, BillingService],
})
export class MonetizationModule {}
