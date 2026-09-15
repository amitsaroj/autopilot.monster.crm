import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { randomUUID } from 'node:crypto';

import { VoiceCallRepository } from './voice-call.repository';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { PricingService } from '../pricing/pricing.service';
import { BillingService } from '../billing/billing.service';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { VoiceProviderRegistry } from './providers/voice-provider.registry';
import { StorageService } from '../../storage/storage.service';

/** Ephemeral context handed to a /voice/stream WebSocket connection via an opaque token — see buildStreamUrl. */
export interface VoiceStreamContext {
  tenantId: string;
  agentId?: string;
  leadId?: string;
  contactId?: string;
  voice?: string;
  script?: string;
  /** When set, the AI agent is given a transfer_to_human tool that dials this number. */
  humanTransferNumber?: string;
}

const STREAM_TOKEN_PREFIX = 'voice-stream-token:';
/** A real call's Media Stream connects within seconds of being placed; this just needs to outlive normal setup/ringing time. */
const STREAM_TOKEN_TTL_SECONDS = 10 * 60;

export interface CreateOutboundCallInput {
  to: string;
  wssUrl: string;
  voiceProfile?: string;
  campaignId?: string;
  recipientId?: string;
  /** Ask the provider to run answering-machine detection; reported later via handleAmdCallback. */
  machineDetection?: boolean;
}

export interface TwilioStatusUpdate {
  sid: string;
  status: string;
  durationSeconds?: number;
  recordingUrl?: string;
  from?: string;
  to?: string;
  direction?: 'INBOUND' | 'OUTBOUND';
}

export interface CallAnalysisResult {
  summary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

@Injectable()
export class VoiceCallService {
  private readonly logger = new Logger(VoiceCallService.name);

  constructor(
    private readonly voiceCallRepository: VoiceCallRepository,
    private readonly providerRegistry: VoiceProviderRegistry,
    private readonly voicePhoneNumberService: VoicePhoneNumberService,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef,
    @InjectQueue(QUEUE_NAMES.VOICE)
    private readonly voiceQueue: Queue,
    private readonly storageService: StorageService,
  ) {}

  private baseHttpUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:8000';
    return appUrl.replace(/\/$/, '');
  }

  /**
   * The /voice/stream WebSocket is only ever meant to be opened by Twilio's
   * Media Streams feature, fetching the URL we hand it in TwiML — but a raw
   * `ws` connection has no way to run through JwtAuthGuard/TenantGuard, and
   * Twilio can't send a custom Authorization header either. So instead of
   * putting tenantId/contactId/leadId/script directly in the URL (which lets
   * anyone who can reach the socket supply their own and pull an arbitrary
   * tenant's data into a live AI session), we mint a random opaque token,
   * stash the real context server-side in Redis with a short TTL, and hand
   * out only the token. RealtimeAiGateway resolves it back to this context
   * and deletes it on first use — the URL itself carries no trust anymore.
   */
  async buildStreamUrl(
    tenantId: string,
    params: {
      agentId?: string;
      leadId?: string;
      contactId?: string;
      voice?: string;
      script?: string;
      humanTransferNumber?: string;
    } = {},
  ): Promise<string> {
    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:8000';
    const wsBase = appUrl.replace(/^http/i, 'ws');

    const token = randomUUID();
    const context: VoiceStreamContext = { tenantId, ...params };
    await this.voiceQueue.client.set(
      `${STREAM_TOKEN_PREFIX}${token}`,
      JSON.stringify(context),
      'EX',
      STREAM_TOKEN_TTL_SECONDS,
    );

    return `${wsBase}/voice/stream?token=${token}`;
  }

  /** Single-use: resolves a /voice/stream token to its real context and immediately invalidates it. */
  async resolveStreamToken(token: string): Promise<VoiceStreamContext | null> {
    const key = `${STREAM_TOKEN_PREFIX}${token}`;
    const raw = await this.voiceQueue.client.get(key);
    if (!raw) {
      return null;
    }
    await this.voiceQueue.client.del(key);
    try {
      return JSON.parse(raw) as VoiceStreamContext;
    } catch {
      return null;
    }
  }

  async findAll(tenantId: string): Promise<VoiceCall[]> {
    return this.voiceCallRepository.findAll(tenantId, {
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<VoiceCall> {
    const byId = await this.voiceCallRepository.findById(tenantId, id);
    if (byId) {
      return byId;
    }

    const bySid = await this.voiceCallRepository.findBySid(tenantId, id);
    if (!bySid) {
      throw new NotFoundException('Call not found');
    }
    return bySid;
  }

  findBySidGlobal(sid: string): Promise<VoiceCall | null> {
    return this.voiceCallRepository.findBySidGlobal(sid);
  }

  async initiateOutbound(tenantId: string, input: CreateOutboundCallInput): Promise<VoiceCall> {
    const provider = await this.providerRegistry.getProvider(tenantId);
    const from = await provider.getFromNumber(tenantId);

    // Every outbound call gets a status callback — without this, a call that
    // the provider actually places has no way to ever tell us it answered,
    // rang out, or failed. Only the "rejected before dial" path below moves
    // stats otherwise, which is silently wrong for any call that really
    // reaches the network.
    const statusCallbackUrl = `${this.baseHttpUrl()}/api/v1/voice/twilio/status-callback`;
    const amdCallbackUrl = `${this.baseHttpUrl()}/api/v1/voice/twilio/amd-callback`;
    const recordingCallbackUrl = `${this.baseHttpUrl()}/api/v1/voice/twilio/recording-callback`;

    let sid: string;
    try {
      sid = await provider.initiateOutboundCall(tenantId, input.to, input.wssUrl, {
        statusCallbackUrl,
        machineDetection: input.machineDetection,
        amdCallbackUrl: input.machineDetection ? amdCallbackUrl : undefined,
        recordingCallbackUrl,
      });
    } catch {
      // The provider rejected the call before it ever got a real SID (bad
      // credentials, invalid number, provider outage, ...). Record it as a
      // failed attempt anyway — a campaign's `resume()` decides what's
      // "already attempted" by looking for a VoiceCall row for this number,
      // and campaign stats only ever move via this row or a later provider
      // webhook. Without persisting the failure here, a number that can
      // never be dialed gets silently redialed forever on every resume, and
      // the campaign's callsFailed count never reflects it (no webhook is
      // ever coming for a call the provider never started). The error is
      // already logged by the provider; this row just needs a unique,
      // clearly-synthetic sid so it doesn't collide with real provider SIDs.
      return this.voiceCallRepository.create(tenantId, {
        sid: `failed-${randomUUID()}`,
        to: input.to,
        from,
        direction: 'OUTBOUND',
        status: 'FAILED',
        voiceProfile: input.voiceProfile,
        campaignId: input.campaignId,
        recipientId: input.recipientId,
        provider: provider.name,
      });
    }

    const existing = await this.voiceCallRepository.findBySid(tenantId, sid);
    if (existing) {
      return existing;
    }

    const call = await this.voiceCallRepository.create(tenantId, {
      sid,
      to: input.to,
      from,
      direction: 'OUTBOUND',
      status: 'QUEUED',
      voiceProfile: input.voiceProfile,
      campaignId: input.campaignId,
      recipientId: input.recipientId,
      provider: provider.name,
    });

    // Usage should reflect calls that actually reached the provider, not
    // requests that merely hit our API — track it here, the one place both
    // the single-call and bulk-campaign paths funnel through, rather than at
    // the controller (which would double-count nothing here, but couldn't
    // see campaign-originated calls at all).
    await this.trackCallUsage(tenantId);

    return call;
  }

  private async trackCallUsage(tenantId: string): Promise<void> {
    try {
      const billingService = this.moduleRef.get(BillingService, { strict: false });
      const pricingService = this.moduleRef.get(PricingService, { strict: false });
      if (!billingService || !pricingService) {
        return;
      }
      const period = await pricingService.getLimitPeriod(tenantId, 'calls');
      await billingService.trackUsage(tenantId, 'calls', 1, period);
    } catch (err) {
      this.logger.warn(`Failed to track call usage for tenant ${tenantId}`, err as Error);
    }
  }

  async updateFromWebhook(update: TwilioStatusUpdate): Promise<VoiceCall | null> {
    const existing = await this.voiceCallRepository.findBySidGlobal(update.sid);
    if (existing) {
      return this.voiceCallRepository.updateWithTenant(existing.tenantId, existing.id, {
        status: update.status,
        durationSeconds: update.durationSeconds ?? existing.durationSeconds,
        recordingUrl: update.recordingUrl ?? existing.recordingUrl,
      });
    }

    if (!update.from || !update.to) {
      return null;
    }

    const tenantId = await this.voicePhoneNumberService.findTenantIdByNumber(update.to);
    if (!tenantId) {
      return null;
    }

    return this.voiceCallRepository.create(tenantId, {
      sid: update.sid,
      from: update.from,
      to: update.to,
      direction: update.direction ?? 'INBOUND',
      status: update.status,
      durationSeconds: update.durationSeconds ?? 0,
      recordingUrl: update.recordingUrl,
    });
  }

  async persistCallTranscript(
    tenantId: string,
    sid: string,
    transcript: string,
  ): Promise<VoiceCall | null> {
    const call = await this.voiceCallRepository.findBySid(tenantId, sid);
    if (!call) {
      return null;
    }

    return this.voiceCallRepository.updateWithTenant(tenantId, call.id, { transcript });
  }

  async persistCallAnalysis(
    tenantId: string,
    sid: string,
    analysis: CallAnalysisResult,
  ): Promise<VoiceCall | null> {
    const call = await this.voiceCallRepository.findBySid(tenantId, sid);
    if (!call) {
      return null;
    }

    return this.voiceCallRepository.updateWithTenant(tenantId, call.id, {
      aiSummary: analysis.summary,
      sentiment: analysis.sentiment,
    });
  }

  async hangUp(tenantId: string, id: string): Promise<VoiceCall> {
    const call = await this.findOne(tenantId, id);
    const provider = await this.providerRegistry.getProvider(tenantId);
    await provider.hangUpCall(tenantId, call.sid);
    return this.voiceCallRepository.updateWithTenant(tenantId, call.id, {
      status: 'COMPLETED',
    });
  }

  async transferCall(tenantId: string, id: string, to: string): Promise<VoiceCall> {
    const call = await this.findOne(tenantId, id);
    const provider = await this.providerRegistry.getProvider(tenantId);
    await provider.transferCall(tenantId, call.sid, to);
    return this.voiceCallRepository.updateWithTenant(tenantId, call.id, {
      transferredToHuman: true,
    });
  }

  /** Persists Twilio's async Answering Machine Detection result for a call. */
  async persistAnsweredBy(sid: string, answeredBy: string): Promise<VoiceCall | null> {
    const call = await this.voiceCallRepository.findBySidGlobal(sid);
    if (!call) {
      return null;
    }
    return this.voiceCallRepository.updateWithTenant(call.tenantId, call.id, { answeredBy });
  }

  /**
   * Downloads a call's recording from the provider and re-hosts it in MinIO
   * instead of leaving the raw provider URL (which requires provider
   * credentials to fetch and isn't under our access control) as the
   * playback link.
   */
  async persistRecording(sid: string, providerRecordingUrl: string): Promise<VoiceCall | null> {
    const call = await this.voiceCallRepository.findBySidGlobal(sid);
    if (!call) {
      return null;
    }

    try {
      const provider = await this.providerRegistry.getProvider(call.tenantId);
      const buffer = await provider.downloadRecording(call.tenantId, providerRecordingUrl);
      const stored = await this.storageService.putObject(
        call.tenantId,
        `voice-recordings/${call.id}.mp3`,
        buffer,
        'audio/mpeg',
      );
      return this.voiceCallRepository.updateWithTenant(call.tenantId, call.id, {
        recordingUrl: stored.downloadUrl,
        recordingObjectKey: stored.objectKey,
      });
    } catch (err) {
      this.logger.warn(`Failed to re-host recording for call ${call.id}`, err as Error);
      return null;
    }
  }

  getRecordingUrl(call: VoiceCall): { url: string | null } {
    return { url: call.recordingUrl ?? null };
  }

  getTranscript(call: VoiceCall): { transcript: string | null } {
    return { transcript: call.transcript ?? null };
  }

  getSummary(call: VoiceCall): {
    summary: string | null;
    sentiment: VoiceCall['sentiment'] | null;
  } {
    return {
      summary: call.aiSummary ?? null,
      sentiment: call.sentiment ?? null,
    };
  }

  async findTranscripts(tenantId: string): Promise<VoiceCall[]> {
    return this.voiceCallRepository.findWithTranscripts(tenantId);
  }

  async findTranscriptById(tenantId: string, id: string): Promise<VoiceCall> {
    const call = await this.findOne(tenantId, id);
    if (!call.transcript) {
      throw new NotFoundException('Transcript not found');
    }
    return call;
  }

  async findByRecordingUrl(tenantId: string, audioUrl: string): Promise<VoiceCall | null> {
    return this.voiceCallRepository.findByRecordingUrl(tenantId, audioUrl);
  }

  async persistTranscriptById(
    tenantId: string,
    callId: string,
    transcript: string,
  ): Promise<VoiceCall> {
    return this.voiceCallRepository.updateWithTenant(tenantId, callId, { transcript });
  }

  async updateAnalysisById(
    tenantId: string,
    callId: string,
    analysis: CallAnalysisResult,
  ): Promise<VoiceCall> {
    return this.voiceCallRepository.updateWithTenant(tenantId, callId, {
      aiSummary: analysis.summary,
      sentiment: analysis.sentiment,
    });
  }
}
