import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import twilio from 'twilio';

import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { VoiceCall } from '../../database/entities/voice-call.entity';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private clients: Map<string, twilio.Twilio> = new Map();

  constructor(
    private configService: ConfigService,
    private configOrchestrator: ConfigOrchestratorService,
    @InjectRepository(VoiceCall)
    private readonly voiceCallRepo: Repository<VoiceCall>,
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
    const connect = twiml.connect();
    connect.stream({ url: wssUrl });

    try {
      const call = await client.calls.create({
        twiml: twiml.toString(),
        to,
        from,
        record: true,
      });

      // Persist Call Record
      const voiceCall = this.voiceCallRepo.create({
        tenantId,
        sid: call.sid,
        from,
        to,
        direction: 'OUTBOUND',
        status: 'INITIATED',
      });
      await this.voiceCallRepo.save(voiceCall);

      return call.sid;
    } catch (err) {
      this.logger.error('Failed to initiate outbound call', err);
      throw err;
    }
  }

  validateWebhookSignature(
    signature: string | undefined,
    url: string,
    params: Record<string, string>,
  ): boolean {
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') ?? '';
    const isMockToken = !authToken || authToken === 'mocktoken';

    if (process.env.NODE_ENV === 'production' && isMockToken) {
      return false;
    }

    if (isMockToken) {
      return true;
    }

    if (!signature) {
      return false;
    }

    return twilio.validateRequest(authToken, signature, url, params);
  }

  generateIncomingStreamingTwiml(wssUrl: string): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, 'Hello. Please hold while I connect you to an agent.');
    const connect = twiml.connect();
    connect.stream({ url: wssUrl });
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

  async transferCall(tenantId: string, callSid: string, to: string): Promise<void> {
    const { client } = await this.getClient(tenantId);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, 'Transferring your call now.');
    twiml.dial(to);
    await client.calls(callSid).update({ twiml: twiml.toString() });
  }

  generateRoutingTwiml(routingNumber: string, fallbackWssUrl: string): string {
    const twiml = new twilio.twiml.VoiceResponse();
    if (routingNumber) {
      twiml.say({ voice: 'Polly.Amy' }, 'Connecting you to the next available agent.');
      const dial = twiml.dial({ timeout: 20, action: '/v1/voice/twilio/routing-fallback' });
      dial.number(routingNumber);
      return twiml.toString();
    }

    twiml.say({ voice: 'Polly.Amy' }, 'Hello. Please hold while I connect you to an agent.');
    const connect = twiml.connect();
    connect.stream({ url: fallbackWssUrl });
    return twiml.toString();
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

  async extractSentimentStub(callSid: string, tenantId: string) {
    return {
      callSid,
      tenantId,
      sentiment: 'POSITIVE',
      keywords: ['support', 'billing', 'happy'],
      confidence: 0.92,
    };
  }

  async cloneVoiceStub(tenantId: string, sampleUrl: string): Promise<string> {
    this.logger.log(`Cloning voice for tenant ${tenantId} using sample: ${sampleUrl}`);
    return `voice_clone_${Math.random().toString(36).substring(7)}`;
  }

  generateIvrTwiml(_body: Record<string, any>): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, 'Welcome to our IVR system. Press 1 for sales, 2 for support.');
    return twiml.toString();
  }
}
