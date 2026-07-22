import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { RealtimeAiGateway } from './realtime-ai.gateway';
import { TwilioController } from './twilio.controller';
import { VoiceController } from './voice.controller';
import { VoiceCallRepository } from './voice-call.repository';
import { VoiceCallService } from './voice-call.service';
import { VoiceCampaignService } from './voice-campaign.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { VoiceAiService } from './voice-ai.service';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';
import { TwilioModule } from './twilio.module';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { VoiceCampaign } from '../../database/entities/voice-campaign.entity';
import { VoicePhoneNumber } from '../../database/entities/voice-phone-number.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';

@Module({
  imports: [
    ConfigModule,
    TwilioModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.VOICE }),
    TenantSettingsModule,
    forwardRef(() => AiModule),
    forwardRef(() => CrmModule),
    TypeOrmModule.forFeature([VoiceCall, VoiceCampaign, VoicePhoneNumber, Contact, Segment]),
  ],
  controllers: [TwilioController, VoiceController],
  providers: [
    RealtimeAiGateway,
    VoiceCallRepository,
    VoiceCallService,
    VoiceCampaignService,
    VoicePhoneNumberService,
    VoiceAiService,
  ],
  exports: [
    TwilioModule,
    VoiceCallService,
    VoiceCallRepository,
    VoiceCampaignService,
    VoicePhoneNumberService,
    VoiceAiService,
  ],
})
export class VoiceModule {}
