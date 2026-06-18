import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from './storage/storage.module';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { MarketplaceController } from './marketplace/marketplace.controller';
import { MarketplaceService } from './marketplace/marketplace.service';
import { PluginsController } from './plugins/plugins.controller';
import { PlatformController } from './platform.controller';
import { LogsModule } from './logs/logs.module';
import { DashboardMetric } from '../database/entities/dashboard-metric.entity';
import { PlatformSetting } from '../database/entities/platform-setting.entity';
import { Plugin } from '../database/entities/plugin.entity';
import { TenantPlugin } from '../database/entities/tenant-plugin.entity';
import { Contact } from '../database/entities/contact.entity';
import { Deal } from '../database/entities/deal.entity';
import { Company } from '../database/entities/company.entity';

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
    ]),
    LogsModule,
    StorageModule,
  ],
  controllers: [
    SearchController,
    MarketplaceController,
    PluginsController,
    PlatformController,
  ],
  providers: [
    SearchService,
    MarketplaceService,
  ],
  exports: [
    StorageModule,
    SearchService,
    MarketplaceService,
  ],
})
export class PlatformModule {}
