import { createHmac, timingSafeEqual } from 'crypto';
import { Controller, ForbiddenException, Headers, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../common/decorators';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ShopifyWebhookService } from './shopify-webhook.service';

@Controller('integrations/shopify/webhooks')
@Public()
@SkipThrottle()
export class ShopifyWebhookController {
  constructor(
    private readonly webhooks: ShopifyWebhookService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  async receive(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('x-shopify-hmac-sha256') signature?: string,
    @Headers('x-shopify-shop-domain') shop?: string,
    @Headers('x-shopify-topic') topic?: string,
    @Headers('x-shopify-webhook-id') deliveryId?: string,
    @Headers('x-shopify-event-id') eventId?: string,
  ) {
    const secret = this.config.get<string>('app.shopify.clientSecret');
    if (!secret || !request.rawBody)
      throw new ForbiddenException('Shopify webhook verification is not configured');
    if (!signature || !/^[A-Za-z0-9+/]{43}=$/.test(signature))
      throw new ForbiddenException('Invalid Shopify webhook signature');
    const actual = Buffer.from(signature, 'base64');
    const expected = createHmac('sha256', secret).update(request.rawBody).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new ForbiddenException('Shopify webhook signature mismatch');
    if (!shop || !topic || !deliveryId)
      throw new ForbiddenException('Required Shopify webhook headers are missing');
    return this.webhooks.ingest(shop, topic, deliveryId, request.rawBody, eventId);
  }
}
