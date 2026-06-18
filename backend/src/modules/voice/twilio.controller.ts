import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';

import { TwilioService } from './twilio.service';
import { VoiceCallService } from './voice-call.service';

@Controller('v1/voice/twilio')
export class TwilioController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly voiceCallService: VoiceCallService,
  ) {}

  @Post('inbound')
  @Public()
  handleInboundCall(@Req() _req: Request, @Res() res: Response, @Headers('host') host: string) {
    const wssUrl = `wss://${host}/voice/stream`;
    const twiml = this.twilioService.generateIncomingStreamingTwiml(wssUrl);
    res.type('text/xml');
    res.send(twiml);
  }

  @Post('status-callback')
  @Public()
  async handleStatusCallback(@Req() req: Request, @Res() res: Response) {
    const callSid = String(req.body.CallSid ?? '');
    const callStatus = String(req.body.CallStatus ?? '');
    const duration = req.body.Duration ? Number(req.body.Duration) : undefined;
    const recordingUrl = req.body.RecordingUrl ? String(req.body.RecordingUrl) : undefined;

    if (callSid) {
      await this.voiceCallService.updateFromWebhook({
        sid: callSid,
        status: callStatus.toUpperCase(),
        durationSeconds: duration,
        recordingUrl,
        from: req.body.From ? String(req.body.From) : undefined,
        to: req.body.To ? String(req.body.To) : undefined,
        direction: req.body.Direction === 'outbound-api' ? 'OUTBOUND' : 'INBOUND',
      });
    }

    res.status(200).send('OK');
  }
}
