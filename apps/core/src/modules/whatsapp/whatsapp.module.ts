import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MetaWebhookController } from './meta-webhook.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [ConfigModule],
  controllers: [MetaWebhookController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
