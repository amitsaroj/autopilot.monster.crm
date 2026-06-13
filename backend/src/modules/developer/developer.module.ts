import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { Webhook } from '../../database/entities/webhook.entity';
import { WebhookDelivery } from '../../database/entities/webhook-delivery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookDelivery])],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class DeveloperModule {}
