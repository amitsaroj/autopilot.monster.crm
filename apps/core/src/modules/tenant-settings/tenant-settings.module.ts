import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TenantSetting } from '../../database/entities/tenant-setting.entity';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';
import { TenantSettingsService } from './tenant-settings.service';
import { TenantSettingsController } from './tenant-settings.controller';
import { AdminTenantSettingsController } from './admin-tenant-settings.controller';
import { ConfigOrchestratorService } from './config-orchestrator.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TenantSetting, PlatformSetting]),
  ],
  controllers: [TenantSettingsController, AdminTenantSettingsController],
  providers: [TenantSettingsService, ConfigOrchestratorService],
  exports: [TenantSettingsService, ConfigOrchestratorService],
})
export class TenantSettingsModule {}
