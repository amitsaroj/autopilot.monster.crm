import { Injectable, NotFoundException } from '@nestjs/common';

import { VoiceCallRepository } from './voice-call.repository';
import { TwilioService } from './twilio.service';
import { VoiceCall } from '../../database/entities/voice-call.entity';

export interface CreateOutboundCallInput {
  to: string;
  wssUrl: string;
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

@Injectable()
export class VoiceCallService {
  constructor(
    private readonly voiceCallRepository: VoiceCallRepository,
    private readonly twilioService: TwilioService,
  ) {}

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
    });
  }

  async updateFromWebhook(update: TwilioStatusUpdate): Promise<VoiceCall | null> {
    const existing = await this.voiceCallRepository.findBySidGlobal(update.sid);
    if (!existing) {
      return null;
    }

    return this.voiceCallRepository.updateWithTenant(existing.tenantId, existing.id, {
      status: update.status,
      durationSeconds: update.durationSeconds ?? existing.durationSeconds,
      recordingUrl: update.recordingUrl ?? existing.recordingUrl,
    });
  }

  async hangUp(tenantId: string, id: string): Promise<VoiceCall> {
    const call = await this.findOne(tenantId, id);
    await this.twilioService.hangUpCall(tenantId, call.sid);
    return this.voiceCallRepository.updateWithTenant(tenantId, call.id, {
      status: 'COMPLETED',
    });
  }

  getRecordingUrl(call: VoiceCall): { url: string | null } {
    return { url: call.recordingUrl ?? null };
  }

  getTranscript(call: VoiceCall): { transcript: string | null } {
    return { transcript: call.transcript ?? null };
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
