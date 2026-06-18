import * as crypto from 'crypto';

import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { WhatsappService } from './whatsapp.service';

@Controller('v1/whatsapp/webhook')
export class MetaWebhookController {
  private readonly appSecret: string;

  constructor(
    private readonly whatsappService: WhatsappService,
    private configService: ConfigService,
  ) {
    this.appSecret = this.configService.get('META_APP_SECRET') || 'mock_secret';
  }

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode === 'subscribe' && token === this.whatsappService.getVerifyToken()) {
      return challenge;
    }
    throw new ForbiddenException('Invalid verify token');
  }

  @Post()
  async receiveMessage(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-tenant-id') tenantHeader: string,
  ) {
    if (this.appSecret !== 'mock_secret' && signature) {
      const rawBody = JSON.stringify(req.body);
      const expectedSig =
        'sha256=' + crypto.createHmac('sha256', this.appSecret).update(rawBody).digest('hex');
      if (expectedSig !== signature) {
        throw new ForbiddenException('Signature mismatch');
      }
    }

    res.status(200).send('OK');

    const tenantId =
      tenantHeader ||
      this.configService.get<string>('DEFAULT_TENANT_ID') ||
      this.extractTenantFromPayload(req.body);

    if (tenantId) {
      await this.whatsappService.processIncomingMessage(tenantId, req.body);
    }
  }

  private extractTenantFromPayload(body: Record<string, unknown>): string {
    const entry = (body.entry as Array<Record<string, unknown>> | undefined)?.[0];
    const changes = (entry?.changes as Array<Record<string, unknown>> | undefined)?.[0];
    const value = changes?.value as Record<string, unknown> | undefined;
    const metadata = value?.metadata as { phone_number_id?: string } | undefined;
    return metadata?.phone_number_id ?? '';
  }
}
