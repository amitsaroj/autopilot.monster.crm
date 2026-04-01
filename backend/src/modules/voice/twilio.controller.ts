import { UseGuards, Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';

import { TwilioService } from './twilio.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('v1/voice/twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('inbound')
  handleInboundCall(@Req() _req: Request, @Res() res: Response, @Headers('host') host: string) {
    // Generate the internal WebSocket URL assuming SSL termination at Edge
    const wssUrl = `wss://${host}/voice/stream`;

    const twiml = this.twilioService.generateIncomingStreamingTwiml(wssUrl);

    res.type('text/xml');
    res.send(twiml);
  }

  @Post('status-callback')
  handleStatusCallback(@Req() req: Request, @Res() res: Response) {
    // Webhook from Twilio when call completes, fails, or is busy
    const { CallSid, CallStatus, Duration } = req.body;
    console.log(`[Twilio Webhook] Call ${CallSid} Status: ${CallStatus}. Duration: ${Duration}s`);

    // In production, emit event to update CRM `activities` or `calls` table

    res.status(200).send('OK');
  }
}
