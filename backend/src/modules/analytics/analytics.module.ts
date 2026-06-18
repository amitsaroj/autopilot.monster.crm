import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DashboardMetric } from '../../database/entities/dashboard-metric.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Lead } from '../../database/entities/lead.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardMetric,
      Deal,
      Contact,
      Lead,
      VoiceCall,
      WhatsAppMessage,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
