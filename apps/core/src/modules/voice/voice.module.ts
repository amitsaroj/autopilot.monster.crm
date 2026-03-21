import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { RealtimeAiGateway } from './realtime-ai.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [TwilioController],
  providers: [TwilioService, RealtimeAiGateway],
  exports: [TwilioService],
})
export class VoiceModule {}
