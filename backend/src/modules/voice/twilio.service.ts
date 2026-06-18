import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private clients: Map<string, twilio.Twilio> = new Map();

  constructor(
    private configService: ConfigService,
    private configOrchestrator: ConfigOrchestratorService,
  ) {}

  async getFromNumber(tenantId: string): Promise<string> {
    const { from } = await this.getClient(tenantId);
    return from;
  }

  async hangUpCall(tenantId: string, callSid: string): Promise<void> {
    const { client } = await this.getClient(tenantId);
    await client.calls(callSid).update({ status: 'completed' });
  }

  private async getClient(tenantId: string): Promise<{ client: twilio.Twilio; from: string }> {
    if (this.clients.has(tenantId)) {
      return { 
        client: this.clients.get(tenantId)!, 
        from: await this.configOrchestrator.get(tenantId, 'twilio_phone_number') || this.configService.get('TWILIO_PHONE_NUMBER') || '+1234567890' 
      };
    }

    const accountSid = await this.configOrchestrator.get(tenantId, 'twilio_account_sid') || this.configService.get('TWILIO_ACCOUNT_SID') || 'ACmock';
    const authToken = await this.configOrchestrator.get(tenantId, 'twilio_auth_token') || this.configService.get('TWILIO_AUTH_TOKEN') || 'mocktoken';
    const from = await this.configOrchestrator.get(tenantId, 'twilio_phone_number') || this.configService.get('TWILIO_PHONE_NUMBER') || '+1234567890';

    let client: twilio.Twilio;
    if (accountSid.startsWith('AC') && accountSid.length === 34) {
      client = twilio(accountSid, authToken);
    } else {
      this.logger.warn(`Tenant ${tenantId} Twilio loaded with mock credentials.`);
      client = twilio('AC' + '0'.repeat(32), '0'.repeat(32)); // Fake but valid format for constructor
    }

    this.clients.set(tenantId, client);
    return { client, from };
  }

  async initiateOutboundCall(tenantId: string, to: string, wssUrl: string) {
    this.logger.log(`Initiating stream call to ${to} for tenant ${tenantId}`);

    const { client, from } = await this.getClient(tenantId);
    const twiml = new twilio.twiml.VoiceResponse();
    // Connect to our NestJS WebSocket Gateway
    const connect = twiml.connect();
    connect.stream({
      url: wssUrl, // e.g., wss://api.autopilot.com/voice/stream
    });

    try {
      const call = await client.calls.create({
        twiml: twiml.toString(),
        to,
        from,
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

  async purchasePhoneNumber(tenantId: string, phoneNumber: string): Promise<string> {
    const { client } = await this.getClient(tenantId);
    const purchased = await client.incomingPhoneNumbers.create({ phoneNumber });
    return purchased.sid;
  }

  async releasePhoneNumber(tenantId: string, twilioSid: string): Promise<void> {
    const { client } = await this.getClient(tenantId);
    await client.incomingPhoneNumbers(twilioSid).remove();
  }

  async searchAvailableNumbers(
    tenantId: string,
    country: string,
    areaCode?: string,
  ): Promise<Array<{ phoneNumber: string; friendlyName: string }>> {
    const { client } = await this.getClient(tenantId);
    const numbers = await client.availablePhoneNumbers(country).local.list({
      areaCode: areaCode ? parseInt(areaCode, 10) : undefined,
      limit: 20,
    });

    return numbers.map((n) => ({
      phoneNumber: n.phoneNumber,
      friendlyName: n.friendlyName,
    }));
  }
}
