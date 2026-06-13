import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetaWebhookController } from './meta-webhook.controller';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WhatsappBroadcast } from '../../database/entities/whatsapp-broadcast.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([WhatsAppMessage, WhatsappBroadcast])],
  controllers: [MetaWebhookController, WhatsappController, BroadcastController],
  providers: [WhatsappService, BroadcastService],
  exports: [WhatsappService, BroadcastService],
})
export class WhatsappModule {}
