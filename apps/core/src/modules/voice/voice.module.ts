import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RealtimeAiGateway } from './realtime-ai.gateway';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { VoiceController } from './voice.controller';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';
import { VoiceCall } from '../../database/entities/voice-call.entity';

@Module({
  imports: [ConfigModule, AiModule, CrmModule, TypeOrmModule.forFeature([VoiceCall])],
  controllers: [TwilioController, VoiceController],
  providers: [TwilioService, RealtimeAiGateway],
  exports: [TwilioService],
})
export class VoiceModule {}
