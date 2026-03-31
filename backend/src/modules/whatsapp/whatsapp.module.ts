import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetaWebhookController } from './meta-webhook.controller';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([WhatsAppMessage])],
  controllers: [MetaWebhookController, WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
