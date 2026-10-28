import { Injectable } from '@nestjs/common';
import twilio from 'twilio';
import { ProviderConfigService } from './provider-config.service';
import { VoiceProvider, VoiceProviderHealth, InitiateCallOptions } from './voice-provider.interface';

/** SignalWire cXML Compatibility API; media uses the existing bidirectional G.711 gateway. */
@Injectable()
export class SignalWireService implements VoiceProvider {
  readonly name = 'signalwire';
  constructor(private readonly configs: ProviderConfigService) {}
  private async configuration(tenantId: string) {
    const cfg = await this.configs.read(tenantId, this.name);
    if (!cfg || !/^[a-z0-9-]+\.signalwire\.com$/.test(cfg.credentials.space ?? '')) throw new Error('SignalWire is not configured');
    return cfg;
  }
  private async request(tenantId: string, path: string, body?: URLSearchParams) {
    const { credentials: c } = await this.configuration(tenantId);
    const response = await fetch(`https://${c.space}/api/laml/2010-04-01/Accounts/${encodeURIComponent(c.accountSid)}/${path}`, {
      method: body ? 'POST' : 'GET', body,
      headers: { Authorization: `Basic ${Buffer.from(`${c.accountSid}:${c.authToken}`).toString('base64')}` },
      signal: AbortSignal.timeout(20000), redirect: 'error',
    });
    if (!response.ok) { const error = new Error(`SignalWire request failed (${response.status})`) as Error & { status: number }; error.status = response.status; throw error; }
    return response.json() as Promise<Record<string, any>>;
  }
  async getFromNumber(tenantId: string) { return String((await this.configuration(tenantId)).settings.defaultCallerId ?? ''); }
  async listPhoneNumbers(tenantId: string) {
    const data = await this.request(tenantId, 'IncomingPhoneNumbers.json?PageSize=1000');
    return (data.incoming_phone_numbers ?? []).map((n: any) => ({ id: n.sid, phoneNumber: n.phone_number, capabilities: n.capabilities ?? {} }));
  }
  async initiateOutboundCall(tenantId: string, to: string, wssUrl: string, options?: InitiateCallOptions) {
    const response = new twilio.twiml.VoiceResponse();
    const url = new URL(wssUrl); const token = url.searchParams.get('token'); url.search = '';
    const stream = response.connect().stream({ url: url.toString() });
    if (token) stream.parameter({ name: 'token', value: token });
    const body = new URLSearchParams({ To: to, From: options?.fromNumber || await this.getFromNumber(tenantId), Twiml: response.toString(), Record: String(options?.record === true), TimeLimit: String(options?.maxDurationSeconds ?? 300) });
    if (options?.statusCallbackUrl) {
      body.set('StatusCallback', options.statusCallbackUrl);
      for (const state of ['initiated', 'ringing', 'answered', 'completed']) body.append('StatusCallbackEvent', state);
    }
    if (options?.recordingCallbackUrl) body.set('RecordingStatusCallback', options.recordingCallbackUrl);
    const call = await this.request(tenantId, 'Calls.json', body);
    if (!call.sid) throw new Error('SignalWire returned no call ID; reconcile before retrying');
    return String(call.sid);
  }
  async getCallStatus(tenantId: string, callId: string) {
    const call = await this.request(tenantId, `Calls/${encodeURIComponent(callId)}.json`);
    return { status: String(call.status).toUpperCase(), durationSeconds: Number(call.duration || 0), costAmount: call.price ? Math.abs(Number(call.price)) : undefined };
  }
  async hangUpCall(tenantId: string, callId: string) { await this.request(tenantId, `Calls/${encodeURIComponent(callId)}.json`, new URLSearchParams({ Status: 'completed' })); }
  async transferCall(tenantId: string, callId: string, to: string) {
    const xml = new twilio.twiml.VoiceResponse(); xml.dial(to);
    await this.request(tenantId, `Calls/${encodeURIComponent(callId)}.json`, new URLSearchParams({ Twiml: xml.toString() }));
  }
  async downloadRecording(tenantId: string, reference: string) {
    const { credentials: c } = await this.configuration(tenantId);
    const url = new URL(reference);
    if (url.protocol !== 'https:' || url.hostname !== c.space || !url.pathname.includes(`/Accounts/${c.accountSid}/Recordings/`)) throw new Error('Invalid recording reference');
    const response = await fetch(url, { headers: { Authorization: `Basic ${Buffer.from(`${c.accountSid}:${c.authToken}`).toString('base64')}` }, redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('Recording download failed');
    return Buffer.from(await response.arrayBuffer());
  }
  validateWebhookSignature(): boolean { return false; }
  async verifyWebhook(tenantId: string, signature: string | undefined, url: string, params: Record<string, string>) {
    const { credentials } = await this.configuration(tenantId);
    return Boolean(signature && credentials.signingKey && twilio.validateRequest(credentials.signingKey, signature, url, params));
  }
  async checkHealth(tenantId: string): Promise<VoiceProviderHealth> {
    try { await this.listPhoneNumbers(tenantId); return { provider: this.name, status: 'CONNECTED', fromNumber: await this.getFromNumber(tenantId) }; }
    catch { return { provider: this.name, status: 'NOT_CONFIGURED', detail: 'Credentials missing, invalid, or provider unavailable' }; }
  }
}
