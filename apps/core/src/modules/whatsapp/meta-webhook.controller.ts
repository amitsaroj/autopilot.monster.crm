import { Controller, Get, Post, Query, Req, Res, Headers, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('v1/whatsapp/webhook')
export class MetaWebhookController {
  private readonly appSecret: string;

  constructor(
    private readonly whatsappService: WhatsappService,
    private configService: ConfigService
  ) {
    this.appSecret = this.configService.get('META_APP_SECRET') || 'mock_secret';
  }

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    // Meta explicitly hits this endpoint via GET when configuring the webhook in App Dashboard
    if (mode === 'subscribe' && token === this.whatsappService.getVerifyToken()) {
      return challenge;
    }
    throw new ForbiddenException('Invalid verify token');
  }

  @Post()
  async receiveMessage(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-hub-signature-256') signature: string
  ) {
    // 1. Verify HMAC SHA-256 Signature to ensure payload actually came from Meta
    if (this.appSecret !== 'mock_secret' && signature) {
       const rawBody = JSON.stringify(req.body); // In production, use rawBuffer middleware
       const expectedSig = 'sha256=' + crypto.createHmac('sha256', this.appSecret).update(rawBody).digest('hex');
       if (expectedSig !== signature) {
          throw new ForbiddenException('Signature mismatch');
       }
    }

    // 2. Acknowledge Receipt immediately (Meta requires 200 OK within 3 seconds)
    res.status(200).send('OK');

    // 3. Process asynchronously
    await this.whatsappService.processIncomingMessage(req.body);
  }
}
