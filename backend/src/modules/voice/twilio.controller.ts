import { Controller, Post, Req, Res, Headers, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

import { TwilioService } from './twilio.service';
import { VoiceCallService } from './voice-call.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { EVENT_NAMES } from '../../events/event.constants';

const TERMINAL_CALL_STATUSES = new Set(['COMPLETED', 'BUSY', 'NO-ANSWER', 'FAILED', 'CANCELED']);

function toTwilioParams(body: Record<string, unknown>): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  }
  return params;
}

@SkipThrottle()
@Controller('v1/voice/twilio')
export class TwilioController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly voiceCallService: VoiceCallService,
    private readonly voicePhoneNumberService: VoicePhoneNumberService,
    private readonly configOrchestrator: ConfigOrchestratorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('inbound')
  @Public()
  async handleInboundCall(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('host') host: string,
    @Headers('x-twilio-signature') signature: string,
  ) {
    const url = `${req.protocol}://${host}${req.originalUrl}`;
    if (!this.twilioService.validateWebhookSignature(signature, url, toTwilioParams(req.body))) {
      throw new ForbiddenException('Invalid Twilio webhook signature');
    }

    const toNumber = String(req.body.To ?? '');
    const tenantId =
      (await this.voicePhoneNumberService.findTenantIdByNumber(toNumber)) ?? 'default';
    const routingNumber = await this.configOrchestrator.get(tenantId, 'voice_routing_number', '');
    const wssUrl = `wss://${host}/voice/stream?tenantId=${tenantId}`;
    const twiml = this.twilioService.generateRoutingTwiml(String(routingNumber ?? ''), wssUrl);

    res.type('text/xml');
    res.send(twiml);
  }

  @Post('routing-fallback')
  @Public()
  async handleRoutingFallback(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('host') host: string,
    @Headers('x-twilio-signature') signature: string,
  ) {
    const url = `${req.protocol}://${host}${req.originalUrl}`;
    if (!this.twilioService.validateWebhookSignature(signature, url, toTwilioParams(req.body))) {
      throw new ForbiddenException('Invalid Twilio webhook signature');
    }

    const toNumber = String(req.body.To ?? req.body.Called ?? '');
    const tenantId =
      (await this.voicePhoneNumberService.findTenantIdByNumber(toNumber)) ?? 'default';
    const wssUrl = `wss://${host}/voice/stream?tenantId=${tenantId}`;
    const twiml = this.twilioService.generateIncomingStreamingTwiml(wssUrl);

    res.type('text/xml');
    res.send(twiml);
  }

  @Post('status-callback')
  @Public()
  async handleStatusCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('host') host: string,
    @Headers('x-twilio-signature') signature: string,
  ) {
    const url = `${req.protocol}://${host}${req.originalUrl}`;
    if (!this.twilioService.validateWebhookSignature(signature, url, toTwilioParams(req.body))) {
      throw new ForbiddenException('Invalid Twilio webhook signature');
    }

    const callSid = String(req.body.CallSid ?? '');
    const callStatus = String(req.body.CallStatus ?? '');
    const duration = req.body.Duration ? Number(req.body.Duration) : undefined;
    const recordingUrl = req.body.RecordingUrl ? String(req.body.RecordingUrl) : undefined;

    if (callSid) {
      const call = await this.voiceCallService.updateFromWebhook({
        sid: callSid,
        status: callStatus.toUpperCase(),
        durationSeconds: duration,
        recordingUrl,
        from: req.body.From ? String(req.body.From) : undefined,
        to: req.body.To ? String(req.body.To) : undefined,
        direction: req.body.Direction === 'outbound-api' ? 'OUTBOUND' : 'INBOUND',
      });

      if (call && TERMINAL_CALL_STATUSES.has(callStatus.toUpperCase())) {
        this.eventEmitter.emit(EVENT_NAMES.CALL_ENDED, {
          tenantId: call.tenantId,
          call: {
            id: call.id,
            to: call.to,
            from: call.from,
            status: call.status,
            direction: call.direction,
          },
        });
      }
    }

    res.status(200).send('OK');
  }
}
