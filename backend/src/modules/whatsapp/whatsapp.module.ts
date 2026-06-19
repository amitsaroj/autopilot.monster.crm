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
import { QUEUE_NAMES } from '../../queue/queue.constants';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.WHATSAPP }),
    TypeOrmModule.forFeature([WhatsAppMessage, WhatsAppTemplate, WhatsAppBroadcast, Contact]),
  ],
  controllers: [MetaWebhookController, WhatsappController],
  providers: [
    WhatsappService,
    WhatsappMessageRepository,
    WhatsappTemplateService,
    WhatsappBroadcastService,
    WhatsappBroadcastProcessor,
  ],
  exports: [WhatsappService, WhatsappTemplateService, WhatsappBroadcastService],
})
export class WhatsappModule {}
