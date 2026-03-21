import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { MetaWebhookController } from './meta-webhook.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MetaWebhookController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
