import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RealtimeAiGateway } from './realtime-ai.gateway';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { VoiceController } from './voice.controller';
import { VoiceCampaignService } from './voice-campaign.service';
import { VoiceCampaignController } from './voice-campaign.controller';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { VoiceCampaign } from '../../database/entities/voice-campaign.entity';

@Module({
  imports: [ConfigModule, AiModule, CrmModule, TypeOrmModule.forFeature([VoiceCall, VoiceCampaign])],
  controllers: [TwilioController, VoiceController, VoiceCampaignController],
  providers: [TwilioService, RealtimeAiGateway, VoiceCampaignService],
  exports: [TwilioService, VoiceCampaignService],
})
export class VoiceModule {}
