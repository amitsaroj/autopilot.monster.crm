import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

import { env } from '../../config/env.config';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import type {
  InitiateCallOptions,
  VoiceProvider,
  VoiceProviderHealth,
} from './providers/voice-provider.interface';

@Injectable()
export class TwilioService implements VoiceProvider {
  readonly name = 'twilio';
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
    const isProduction = env.isProduction;

    if (this.clients.has(tenantId)) {
      const fromNumber =
        (await this.configOrchestrator.get(tenantId, 'twilio_phone_number')) ||
        this.configService.get('TWILIO_PHONE_NUMBER') ||
        '+1234567890';
      if (isProduction && fromNumber === '+1234567890') {
        throw new Error('Twilio phone number is not configured for production');
      }
      return {
        client: this.clients.get(tenantId)!,
        from: fromNumber,
      };
    }

    const accountSid =
      (await this.configOrchestrator.get(tenantId, 'twilio_account_sid')) ||
      this.configService.get('TWILIO_ACCOUNT_SID') ||
      'ACmock';
    const authToken =
      (await this.configOrchestrator.get(tenantId, 'twilio_auth_token')) ||
      this.configService.get('TWILIO_AUTH_TOKEN') ||
      'mocktoken';
    const from =
      (await this.configOrchestrator.get(tenantId, 'twilio_phone_number')) ||
      this.configService.get('TWILIO_PHONE_NUMBER') ||
      '+1234567890';

    let client: twilio.Twilio;
    if (accountSid.startsWith('AC') && accountSid.length === 34) {
      if (isProduction && authToken === 'mocktoken') {
        throw new Error(`Tenant ${tenantId} Twilio auth token is not configured for production`);
      }
      if (isProduction && from === '+1234567890') {
        throw new Error(`Tenant ${tenantId} Twilio phone number is not configured for production`);
      }
      client = twilio(accountSid, authToken);
    } else {
      if (isProduction) {
        throw new Error(`Tenant ${tenantId} Twilio account SID is not configured for production`);
      }
      this.logger.warn(`Tenant ${tenantId} Twilio loaded with mock credentials.`);
      client = twilio('AC' + '0'.repeat(32), '0'.repeat(32)); // Fake but valid format for constructor
    }

    this.clients.set(tenantId, client);
    return { client, from };
  }

  async sendSms(tenantId: string, to: string, body: string): Promise<string> {
    this.logger.log(`Sending SMS to ${to} for tenant ${tenantId}`);

    const { client, from } = await this.getClient(tenantId);
    try {
      const message = await client.messages.create({ to, from, body });
      return message.sid;
    } catch (err) {
      this.logger.error(`Failed to send SMS to ${to}`, err);
      throw err;
    }
  }

  async initiateOutboundCall(
    tenantId: string,
    to: string,
    wssUrl: string,
    options?: InitiateCallOptions,
  ) {
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
        ...(options?.machineDetection
          ? {
              machineDetection: 'DetectMessageEnd' as const,
              asyncAmd: 'true',
              asyncAmdStatusCallback: options.amdCallbackUrl,
              asyncAmdStatusCallbackMethod: 'POST' as const,
            }
          : {}),
        ...(options?.statusCallbackUrl
          ? {
              statusCallback: options.statusCallbackUrl,
              statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
              statusCallbackMethod: 'POST' as const,
            }
          : {}),
        ...(options?.recordingCallbackUrl
          ? {
              recordingStatusCallback: options.recordingCallbackUrl,
              recordingStatusCallbackEvent: ['completed'],
              recordingStatusCallbackMethod: 'POST' as const,
            }
          : {}),
      });

      return call.sid;
    } catch (err) {
      this.logger.error('Failed to initiate outbound call', err);
      throw err;
    }
  }

  /** Downloads a recording's raw audio bytes using this tenant's Twilio credentials for Basic Auth. */
  async downloadRecording(tenantId: string, recordingUrl: string): Promise<Buffer> {
    const { client } = await this.getClient(tenantId);
    const url = recordingUrl.endsWith('.mp3') ? recordingUrl : `${recordingUrl}.mp3`;
    const auth = Buffer.from(`${client.username}:${client.password}`).toString('base64');

    const response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    if (!response.ok) {
      throw new Error(`Failed to download Twilio recording (${response.status})`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  /** Live check — actually asks Twilio to confirm these credentials resolve to a real account. */
  async checkHealth(tenantId: string): Promise<VoiceProviderHealth> {
    const accountSid =
      (await this.configOrchestrator.get(tenantId, 'twilio_account_sid')) ||
      this.configService.get<string>('TWILIO_ACCOUNT_SID') ||
      '';
    const authToken =
      (await this.configOrchestrator.get(tenantId, 'twilio_auth_token')) ||
      this.configService.get<string>('TWILIO_AUTH_TOKEN') ||
      '';
    const fromNumber =
      (await this.configOrchestrator.get(tenantId, 'twilio_phone_number')) ||
      this.configService.get<string>('TWILIO_PHONE_NUMBER') ||
      '';

    if (!accountSid || !authToken || !accountSid.startsWith('AC') || accountSid.length !== 34) {
      return {
        provider: this.name,
        status: 'NOT_CONFIGURED',
        detail: 'Twilio account SID / auth token is not set for this tenant.',
      };
    }

    try {
      const client = twilio(accountSid, authToken);
      await client.api.v2010.accounts(accountSid).fetch();
      return {
        provider: this.name,
        status: 'CONNECTED',
        fromNumber: typeof fromNumber === 'string' ? fromNumber : undefined,
      };
    } catch (err) {
      return {
        provider: this.name,
        status: 'INVALID_CREDENTIALS',
        detail: err instanceof Error ? err.message : 'Twilio rejected these credentials.',
      };
    }
  }

  validateWebhookSignature(
    signature: string | undefined,
    url: string,
    params: Record<string, string>,
  ): boolean {
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') ?? '';
    const isMockToken = !authToken || authToken === 'mocktoken';

    if (env.isProduction && isMockToken) {
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

  generateRoutingTwiml(
    routingNumber: string,
    fallbackWssUrl: string,
    routingFallbackUrl: string,
  ): string {
    const twiml = new twilio.twiml.VoiceResponse();
    if (routingNumber) {
      twiml.say({ voice: 'Polly.Amy' }, 'Connecting you to the next available agent.');
      const dial = twiml.dial({ timeout: 20, action: routingFallbackUrl });
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

  generateIvrTwiml(_body: Record<string, any>): string {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(
      { voice: 'Polly.Amy' },
      'Welcome to our IVR system. Press 1 for sales, 2 for support.',
    );
    return twiml.toString();
  }
}
