import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsDashboardsController } from './analytics-dashboards.controller';
import { AnalyticsReportsController } from './analytics-reports.controller';
import {
  AnalyticsDashboardService,
  AnalyticsDashboardRepository,
} from './analytics-dashboard.service';
import {
  AnalyticsReportService,
  AnalyticsReportRepository,
} from './analytics-report.service';
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
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [
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
    ]),
    forwardRef(() => CrmModule),
  ],
  controllers: [AnalyticsController, AnalyticsDashboardsController, AnalyticsReportsController],
  providers: [
    AnalyticsService,
    AnalyticsDashboardService,
    AnalyticsDashboardRepository,
    AnalyticsReportService,
    AnalyticsReportRepository,
  ],
  exports: [AnalyticsService, AnalyticsDashboardService, AnalyticsReportService],
})
export class AnalyticsModule {}
