import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '../storage/storage.module';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { PluginsController } from './plugins/plugins.controller';
import { PluginsService } from './plugins/plugins.service';
import { PlatformController } from './platform.controller';
import { AuditLogController } from './logs/audit-log.controller';
import { AuditLogService } from './logs/audit-log.service';
import { MonetizationModule } from './monetization.module';
import { DashboardMetric } from '../database/entities/dashboard-metric.entity';
import { PlatformSetting } from '../database/entities/platform-setting.entity';
import { Plugin } from '../database/entities/plugin.entity';
import { TenantPlugin } from '../database/entities/tenant-plugin.entity';
import { Contact } from '../database/entities/contact.entity';
import { Deal } from '../database/entities/deal.entity';
import { Company } from '../database/entities/company.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { AuditLogListener } from './logs/audit-log.listener';
import { SearchIndexQueueService } from './search/search-index-queue.service';
import { SearchIndexEventListener } from './search/search-index-event.listener';
import { QUEUE_NAMES } from '../queue/queue.constants';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardMetric,
      PlatformSetting,
      Plugin,
      TenantPlugin,
      Contact,
      Deal,
      Company,
      AuditLog,
    ]),
    StorageModule,
    MonetizationModule,
    MarketplaceModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.SEARCH_INDEX }),
  ],
  controllers: [SearchController, AuditLogController, PluginsController, PlatformController],
  providers: [
    SearchService,
    AuditLogService,
    AuditLogListener,
    SearchIndexQueueService,
    SearchIndexEventListener,
    PluginsService,
  ],
  exports: [
    StorageModule,
    SearchService,
    AuditLogService,
    SearchIndexQueueService,
    MarketplaceModule,
    PluginsService,
  ],
})
export class PlatformModule {}
