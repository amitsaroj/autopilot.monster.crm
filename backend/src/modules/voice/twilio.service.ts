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

  async getCall(tenantId: string, sid: string): Promise<VoiceCall | null> {
    return this.voiceCallRepo.findOne({ where: { tenantId, sid } });
  }

  async updateCallStatus(sid: string, status: string, duration?: number, recordingUrl?: string) {
    await this.voiceCallRepo.update({ sid }, { 
      status, 
      durationSeconds: duration, 
      recordingUrl 
    });
  }

  async saveCall(call: VoiceCall): Promise<VoiceCall> {
    return this.voiceCallRepo.save(call);
  }

  generateIncomingStreamingTwiml(wssUrl: string): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'Polly.Amy' }, 'Hello. Please hold while I connect you to an agent.');
    const connect = twiml.connect();
    connect.stream({ url: wssUrl });
    return twiml.toString();
  }

  generateIvrTwiml(options: any): string {
    const twiml = new twilio.twiml.VoiceResponse();
    const gather = twiml.gather({
      numDigits: 1,
      action: '/api/v1/voice/ivr-callback',
    });
    gather.say(options.greeting || 'Welcome to Autopilot Monster. Press 1 for Sales, 2 for Support.');
    return twiml.toString();
  }

  async extractSentimentStub(callSid: string, _tenantId?: string): Promise<{ sentiment: string; keywords: string[] }> {
    this.logger.log(`[STUB] Extracting sentiment for call ${callSid}`);
    return {
      sentiment: 'POSITIVE',
      keywords: ['interested', 'pricing', 'demo'],
    };
  }

  async cloneVoiceStub(tenantId: string, sampleUrl: string): Promise<string> {
    this.logger.log(`[STUB] Cloning voice for tenant ${tenantId} from ${sampleUrl}`);
    return `voice_clone_${Date.now()}`;
  }
}
