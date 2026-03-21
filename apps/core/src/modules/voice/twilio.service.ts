import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private client: twilio.Twilio;
  private readonly twilioNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID') || 'ACmock';
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN') || 'mocktoken';
    this.twilioNumber = this.configService.get('TWILIO_PHONE_NUMBER') || '+1234567890';
    
    // We only initialize the real client if credentials match a real SID pattern, to prevent crash on mock dev.
    if (accountSid.startsWith('AC') && accountSid.length === 34) {
      this.client = twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio loaded with mock credentials. API calls will fail.');
    }
  }

  async initiateOutboundCall(to: string, wssUrl: string) {
    this.logger.log(`Initiating stream call to ${to}`);
    
    const twiml = new twilio.twiml.VoiceResponse();
    // Connect to our NestJS WebSocket Gateway
    const connect = twiml.connect();
    connect.stream({
      url: wssUrl, // e.g., wss://api.autopilot.com/voice/stream
    });

    try {
      if (!this.client) throw new Error('Twilio client not initialized');
      const call = await this.client.calls.create({
        twiml: twiml.toString(),
        to,
        from: this.twilioNumber,
        record: true,
      });
      return call.sid;
    } catch (err) {
      this.logger.error('Failed to initiate outbound call', err);
      throw err;
    }
  }

  generateIncomingStreamingTwiml(wssUrl: string): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, 'Hello. Please hold while I connect you to an agent.');
    const connect = twiml.connect();
    connect.stream({
      url: wssUrl, // e.g. wss://api.autopilot.com/voice/stream
    });
    return twiml.toString();
  }
}
