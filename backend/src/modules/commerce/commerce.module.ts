import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopifyConnection } from '../../database/entities/shopify-connection.entity';
import { ShopifyOAuthState } from '../../database/entities/shopify-oauth-state.entity';
import { ShopifyWebhookEvent } from '../../database/entities/shopify-webhook-event.entity';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import { ShopifyWebhookProcessor } from './shopify-webhook.processor';
import { ShopifyWebhookService } from './shopify-webhook.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { BullModule } from '@nestjs/bull';
import {
  ShopifyIntegrationController,
  ShopifyOAuthCallbackController,
} from './shopify-integration.controller';
import { ShopifyIntegrationService } from './shopify-integration.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ShopifyConnection, ShopifyOAuthState, ShopifyWebhookEvent]),
    BullModule.registerQueue({ name: QUEUE_NAMES.SHOPIFY }),
  ],
  controllers: [
    ShopifyIntegrationController,
    ShopifyOAuthCallbackController,
    ShopifyWebhookController,
  ],
  providers: [ShopifyIntegrationService, ShopifyWebhookService, ShopifyWebhookProcessor],
  exports: [ShopifyIntegrationService],
})
export class CommerceModule {}
