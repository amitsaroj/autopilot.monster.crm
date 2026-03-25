import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMetricsController } from './admin-metrics.controller';
import { AdminMetricsService } from './admin-metrics.service';
import { Tenant } from '../../../database/entities/tenant.entity';
import { UserEntity as User } from '../../../../../auth/src/entities/user.entity';
import { Subscription } from '../../../database/entities/subscription.entity';
import { Invoice } from '../../../database/entities/invoice.entity';
import { MonetizationModule } from '../../monetization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, User, Subscription, Invoice]),
    MonetizationModule,
  ],
  controllers: [AdminMetricsController],
  providers: [AdminMetricsService],
  exports: [AdminMetricsService],
})
export class AdminMetricsModule {}
