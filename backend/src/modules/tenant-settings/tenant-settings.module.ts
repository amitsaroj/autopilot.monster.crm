import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TenantSetting } from '../../database/entities/tenant-setting.entity';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';
import { ApiKey } from '../../database/entities/api-key.entity';
import { OAuthApp } from '../../database/entities/oauth-app.entity';
import { Webhook } from '../../database/entities/webhook.entity';
import { TenantSettingsService } from './tenant-settings.service';
import { TenantSettingsController } from './tenant-settings.controller';
import { AdminTenantSettingsController } from './admin-tenant-settings.controller';
import { DeveloperSettingsController } from './developer-settings.controller';
import { DeveloperSettingsService } from './developer-settings.service';
import { ConfigOrchestratorService } from './config-orchestrator.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TenantSetting, PlatformSetting, ApiKey, Webhook, OAuthApp]),
  ],
  controllers: [
    TenantSettingsController,
    AdminTenantSettingsController,
    DeveloperSettingsController,
  ],
  providers: [TenantSettingsService, DeveloperSettingsService, ConfigOrchestratorService],
  exports: [TenantSettingsService, ConfigOrchestratorService, DeveloperSettingsService],
})
export class TenantSettingsModule {}
