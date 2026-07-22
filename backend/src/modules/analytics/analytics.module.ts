import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AdvancedAnalyticsController } from './advanced-analytics.controller';
import { AdvancedAnalyticsService } from './advanced-analytics.service';
import { AnalyticsDashboardsController } from './analytics-dashboards.controller';
import { AnalyticsReportsController } from './analytics-reports.controller';
import { AnalyticsQueueService } from './analytics-queue.service';
import { AnalyticsEventListener } from './analytics-event.listener';
import {
  AnalyticsDashboardService,
  AnalyticsDashboardRepository,
} from './analytics-dashboard.service';
import { AnalyticsReportService, AnalyticsReportRepository } from './analytics-report.service';
import { DashboardMetric } from '../../database/entities/dashboard-metric.entity';
import { AnalyticsDashboard } from '../../database/entities/analytics-dashboard.entity';
import { AnalyticsReport } from '../../database/entities/analytics-report.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Lead } from '../../database/entities/lead.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { Message } from '../../database/entities/message.entity';
import { Campaign } from '../../database/entities/campaign.entity';
import { CrmModule } from '../crm/crm.module';
import { QUEUE_NAMES } from '../../queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.ANALYTICS }),
    TypeOrmModule.forFeature([
      DashboardMetric,
      AnalyticsDashboard,
      AnalyticsReport,
      Deal,
      Contact,
      Lead,
      VoiceCall,
      WhatsAppMessage,
      UsageRecord,
      Message,
      Campaign,
    ]),
    forwardRef(() => CrmModule),
  ],
  controllers: [
    AnalyticsController,
    AdvancedAnalyticsController,
    AnalyticsDashboardsController,
    AnalyticsReportsController,
  ],
  providers: [
    AnalyticsService,
    AdvancedAnalyticsService,
    AnalyticsDashboardService,
    AnalyticsDashboardRepository,
    AnalyticsReportService,
    AnalyticsReportRepository,
    AnalyticsQueueService,
    AnalyticsEventListener,
  ],
  exports: [
    AnalyticsService,
    AnalyticsDashboardService,
    AnalyticsReportService,
    AnalyticsQueueService,
  ],
})
export class AnalyticsModule {}
