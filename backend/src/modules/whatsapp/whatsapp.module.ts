import { WhatsappAccountService } from './whatsapp-account.service';
import { WhatsappAccountController } from './whatsapp-account.controller';
import { MetaWhatsappProvider, WhatsappProviderRegistry } from './whatsapp-provider';
import { WhatsAppAccount } from '../../database/entities/whatsapp-account.entity';
import { WhatsAppConsent } from '../../database/entities/whatsapp-consent.entity';
import { WhatsappConsentService } from './whatsapp-consent.service';
import { WhatsappConsentController } from './whatsapp-consent.controller';
import { WhatsappWebhookProcessor } from './whatsapp-webhook.processor';
import { UserEntity } from '../auth/entities/user.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { MonetizationModule } from '../monetization.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { MetaWebhookController } from './meta-webhook.controller';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import { WhatsappBroadcastProcessor } from './whatsapp-broadcast.processor';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WhatsAppTemplate } from '../../database/entities/whatsapp-template.entity';
import { WhatsAppBroadcast } from '../../database/entities/whatsapp-broadcast.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';

@Module({
  imports: [
    ConfigModule,
    MonetizationModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.WHATSAPP }),
    TypeOrmModule.forFeature([
      WhatsAppAccount,
      WhatsAppConsent,
      UserEntity,
      UsageRecord,
      WhatsAppMessage,
      WhatsAppTemplate,
      WhatsAppBroadcast,
      Contact,
      Segment,
    ]),
  ],
  controllers: [
    MetaWebhookController,
    WhatsappController,
    WhatsappAccountController,
    WhatsappConsentController,
  ],
  providers: [
    WhatsappAccountService,
    WhatsappConsentService,
    MetaWhatsappProvider,
    WhatsappProviderRegistry,
    WhatsappWebhookProcessor,
    WhatsappService,
    WhatsappMessageRepository,
    WhatsappTemplateService,
    WhatsappBroadcastService,
    WhatsappBroadcastProcessor,
  ],
  exports: [
    WhatsappAccountService,
    WhatsappConsentService,
    WhatsappService,
    WhatsappTemplateService,
    WhatsappBroadcastService,
  ],
})
export class WhatsappModule {}
