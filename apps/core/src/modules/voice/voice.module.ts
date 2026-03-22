import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RealtimeAiGateway } from './realtime-ai.gateway';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [ConfigModule, AiModule, CrmModule],
  controllers: [TwilioController],
  providers: [TwilioService, RealtimeAiGateway],
  exports: [TwilioService],
})
export class VoiceModule {}
