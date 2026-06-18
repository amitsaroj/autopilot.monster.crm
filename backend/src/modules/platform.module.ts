import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AuditLogService } from './logs/audit-log.service';
import { AuditLogController } from './logs/audit-log.controller';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { MarketplaceController } from './marketplace/marketplace.controller';
import { PluginsController } from './plugins/plugins.controller';
import { PlatformController } from './platform.controller';
import { DashboardMetric } from '../database/entities/dashboard-metric.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { PlatformSetting } from '../database/entities/platform-setting.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DashboardMetric, AuditLog, PlatformSetting])],
  controllers: [
    AnalyticsController,
    AuditLogController,
    SearchController,
    MarketplaceController,
    PluginsController,
    PlatformController,
  ],
  providers: [
    AnalyticsService,
    AuditLogService,
    SearchService,
  ],
  exports: [
    AnalyticsService,
    AuditLogService,
    SearchService,
  ],
})
export class PlatformModule {}
