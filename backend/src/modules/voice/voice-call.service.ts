import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { VoiceCallRepository } from './voice-call.repository';
import { TwilioService } from './twilio.service';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { VoiceCall } from '../../database/entities/voice-call.entity';

export interface CreateOutboundCallInput {
  to: string;
  wssUrl: string;
  voiceProfile?: string;
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
  constructor(
    private readonly voiceCallRepository: VoiceCallRepository,
    private readonly twilioService: TwilioService,
    private readonly voicePhoneNumberService: VoicePhoneNumberService,
    private readonly configService: ConfigService,
  ) {}

  buildStreamUrl(
    tenantId: string,
    params: { agentId?: string; leadId?: string; voice?: string } = {},
  ): string {
    const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:8000';
    const wsBase = appUrl.replace(/^http/i, 'ws');
    const query = new URLSearchParams({ tenantId });
    if (params.agentId) {
      query.set('agentId', params.agentId);
    }
    if (params.leadId) {
      query.set('leadId', params.leadId);
    }
    if (params.voice) {
      query.set('voice', params.voice);
    }
    return `${wsBase}/voice/stream?${query.toString()}`;
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

  async initiateOutbound(tenantId: string, input: CreateOutboundCallInput): Promise<VoiceCall> {
    const from = await this.twilioService.getFromNumber(tenantId);
    const sid = await this.twilioService.initiateOutboundCall(tenantId, input.to, input.wssUrl);

    const existing = await this.voiceCallRepository.findBySid(tenantId, sid);
    if (existing) {
      return existing;
    }

    return this.voiceCallRepository.create(tenantId, {
      sid,
      to: input.to,
      from,
      direction: 'OUTBOUND',
      status: 'QUEUED',
      voiceProfile: input.voiceProfile,
    });
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
    await this.twilioService.hangUpCall(tenantId, call.sid);
    return this.voiceCallRepository.updateWithTenant(tenantId, call.id, {
      status: 'COMPLETED',
    });
  }

  async transferCall(tenantId: string, id: string, to: string): Promise<VoiceCall> {
    const call = await this.findOne(tenantId, id);
    await this.twilioService.transferCall(tenantId, call.sid, to);
    return call;
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
}
