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

import {
  MetaWebhookController,
  WhatsappReconciliationController,
  WhatsappWebhookAdminController,
  WhatsappWebhookTenantController,
} from './meta-webhook.controller';
import { WhatsAppWebhookEvent } from '../../database/entities/whatsapp-webhook-event.entity';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappMessageRepository } from './whatsapp.repository';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import { WhatsappBroadcastProcessor } from './whatsapp-broadcast.processor';
import { WhatsappBroadcastRecoveryService } from './whatsapp-broadcast-recovery.service';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WhatsAppTemplate } from '../../database/entities/whatsapp-template.entity';
import { WhatsAppTemplateHistory } from '../../database/entities/whatsapp-template-history.entity';
import { WhatsAppBroadcast } from '../../database/entities/whatsapp-broadcast.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { TeamGroup } from '../../database/entities/team-group.entity';
import { Notification } from '../../database/entities/notification.entity';
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
      WhatsAppTemplateHistory,
      WhatsAppBroadcast,
      Contact,
      Segment,
      TeamGroup,
      WhatsAppWebhookEvent,
      Notification,
    ]),
  ],
  controllers: [
    MetaWebhookController,
    WhatsappController,
    WhatsappAccountController,
    WhatsappConsentController,
    WhatsappReconciliationController,
    WhatsappWebhookAdminController,
    WhatsappWebhookTenantController,
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
    WhatsappBroadcastRecoveryService,
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
