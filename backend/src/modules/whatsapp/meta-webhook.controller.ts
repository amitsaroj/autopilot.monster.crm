import { createHmac, timingSafeEqual, createHash } from 'crypto';
import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Headers,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Request, Response } from 'express';
import { Queue } from 'bull';
import { SkipThrottle } from '@nestjs/throttler';
import { WhatsappService } from './whatsapp.service';
import { WhatsappAccountService } from './whatsapp-account.service';
import { WhatsappConsentService } from './whatsapp-consent.service';
import { Public } from '../../common/decorators/public.decorator';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { env } from '../../config/env.config';
import type { WhatsappWebhookJob } from './whatsapp-webhook.processor';
@SkipThrottle()
@Controller('whatsapp/webhook')
export class MetaWebhookController {
  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly config: ConfigService,
    private readonly accounts: WhatsappAccountService,
    private readonly consent: WhatsappConsentService,
    @InjectQueue(QUEUE_NAMES.WHATSAPP) private readonly queue: Queue<WhatsappWebhookJob>,
  ) {}
  @Get()
  @Public()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const configured = this.whatsapp.getVerifyToken();
    if (configured && mode === 'subscribe' && token === configured) return challenge;
    throw new ForbiddenException('Invalid verify token');
  }
  @Post()
  @Public()
  async receiveMessage(
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
    @Headers('x-hub-signature-256') signature?: string,
  ) {
    const secret = this.config.get<string>('META_APP_SECRET') || env.whatsapp.appSecret;
    if (!secret || secret === 'mock_secret' || !req.rawBody)
      throw new ForbiddenException('Webhook verification is not configured');
    if (!signature || !/^sha256=[a-f0-9]{64}$/.test(signature))
      throw new ForbiddenException('Missing or invalid webhook signature');
    const actual = Buffer.from(signature.slice(7), 'hex');
    const expected = createHmac('sha256', secret).update(req.rawBody).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new ForbiddenException('Signature mismatch');
    const body = req.body as {
      entry?: Array<{
        id?: string;
        changes?: Array<{ field?: string; value?: Record<string, unknown> }>;
      }>;
    };
    if (!Array.isArray(body.entry)) throw new BadRequestException('Invalid webhook payload');
    for (const entry of body.entry)
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phone = String(
          (value?.metadata as { phone_number_id?: string } | undefined)?.phone_number_id ?? '',
        );
        const tenantId = await this.accounts.findTenantByPhoneNumberId(phone);
        if (!tenantId || !value) continue;
        const messages = value.messages as
          | Array<{ from?: string; text?: { body?: string }; button?: { text?: string } }>
          | undefined;
        for (const message of messages ?? []) {
          const text = message.text?.body ?? message.button?.text;
          if (message.from && text && this.whatsapp.isOptOut(text))
            await this.consent.suppress(tenantId, message.from);
        }
        const payload = { entry: [{ id: entry.id, changes: [change] }] };
        const digest = createHash('sha256')
          .update(tenantId + JSON.stringify(payload))
          .digest('hex');
        // Signed account metadata is authoritative; enqueue before acknowledgment.
        await this.queue.add(
          'webhook-event',
          { tenantId, payload },
          {
            jobId: `webhook-${digest}`,
            attempts: 8,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 10000,
            removeOnFail: false,
          },
        );
      }
    res.status(200).send('OK');
  }
}
