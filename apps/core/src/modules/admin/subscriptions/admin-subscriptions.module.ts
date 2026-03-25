import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { Subscription } from '@autopilot/core/database/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [AdminSubscriptionsController],
  providers: [AdminSubscriptionsService],
  exports: [AdminSubscriptionsService],
})
export class AdminSubscriptionsModule {}
