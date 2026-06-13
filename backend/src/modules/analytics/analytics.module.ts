import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { DashboardMetric } from '../../database/entities/dashboard-metric.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Lead } from '../../database/entities/lead.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { Campaign } from '../../database/entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardMetric, Deal, Contact, Lead, VoiceCall, Campaign])],
  controllers: [AnalyticsController, AdvancedAnalyticsController],
  providers: [AnalyticsService, AdvancedAnalyticsService],
  exports: [AnalyticsService, AdvancedAnalyticsService],
})
export class AnalyticsModule {}
