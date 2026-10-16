import { Module } from '@nestjs/common';
import { SubAdminSettingsController } from './sub-admin-settings.controller';
import { SubAdminSettingsService } from './sub-admin-settings.service';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [SubAdminSettingsController],
  providers: [SubAdminSettingsService],
  exports: [SubAdminSettingsService],
})
export class SubAdminSettingsModule {}
