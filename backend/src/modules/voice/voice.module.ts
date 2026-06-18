import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RealtimeAiGateway } from './realtime-ai.gateway';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { VoiceController } from './voice.controller';
import { VoiceCallRepository } from './voice-call.repository';
import { VoiceCallService } from './voice-call.service';
import { VoiceCampaignService } from './voice-campaign.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { VoiceCampaign } from '../../database/entities/voice-campaign.entity';
import { VoicePhoneNumber } from '../../database/entities/voice-phone-number.entity';

@Module({
  imports: [
    ConfigModule,
    AiModule,
    forwardRef(() => CrmModule),
    TypeOrmModule.forFeature([VoiceCall, VoiceCampaign, VoicePhoneNumber]),
  ],
  controllers: [TwilioController, VoiceController],
  providers: [
    TwilioService,
    RealtimeAiGateway,
    VoiceCallRepository,
    VoiceCallService,
    VoiceCampaignService,
    VoicePhoneNumberService,
  ],
  exports: [TwilioService, VoiceCallService, VoiceCampaignService, VoicePhoneNumberService],
})
export class VoiceModule {}
