import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RealtimeAiGateway } from './realtime-ai.gateway';
import { TwilioController } from './twilio.controller';
import { VoiceController } from './voice.controller';
import { VoiceCallRepository } from './voice-call.repository';
import { VoiceCallService } from './voice-call.service';
import { VoiceCampaignService } from './voice-campaign.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';
import { TwilioModule } from './twilio.module';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { VoiceCampaign } from '../../database/entities/voice-campaign.entity';
import { VoicePhoneNumber } from '../../database/entities/voice-phone-number.entity';

@Module({
  imports: [
    ConfigModule,
    TwilioModule,
    forwardRef(() => AiModule),
    forwardRef(() => CrmModule),
    TypeOrmModule.forFeature([VoiceCall, VoiceCampaign, VoicePhoneNumber]),
  ],
  controllers: [TwilioController, VoiceController],
  providers: [
    RealtimeAiGateway,
    VoiceCallRepository,
    VoiceCallService,
    VoiceCampaignService,
    VoicePhoneNumberService,
  ],
  exports: [TwilioModule, VoiceCallService, VoiceCampaignService, VoicePhoneNumberService],
})
export class VoiceModule {}
