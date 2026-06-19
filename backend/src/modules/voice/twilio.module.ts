import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TwilioService } from './twilio.service';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';

@Module({
  imports: [ConfigModule, TenantSettingsModule],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
