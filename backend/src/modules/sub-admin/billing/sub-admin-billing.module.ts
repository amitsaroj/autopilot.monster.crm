import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAdminBillingController } from './sub-admin-billing.controller';
import { SubAdminBillingService } from './sub-admin-billing.service';
import { Subscription } from '../../../database/entities/subscription.entity';
import { Invoice } from '../../../database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Invoice])],
  controllers: [SubAdminBillingController],
  providers: [SubAdminBillingService],
  exports: [SubAdminBillingService],
})
export class SubAdminBillingModule {}
