import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { RealtimeAiGateway } from './realtime-ai.gateway';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [ConfigModule, AiModule, CrmModule],
  controllers: [TwilioController],
  providers: [TwilioService, RealtimeAiGateway],
  exports: [TwilioService],
})
export class VoiceModule {}
