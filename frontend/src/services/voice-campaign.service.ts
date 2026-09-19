import api from '../lib/api/client';

export type VoiceCampaignStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STOPPED';

export type VoiceCampaignRecipientStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'CALLING'
  | 'COMPLETED'
  | 'FAILED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'RETRY_PENDING'
  | 'SKIPPED'
  | 'CANCELLED';

export interface VoiceCampaignStats {
  campaignId: string;
  status: VoiceCampaignStatus;
  totalContacts: number;
  callsMade: number;
  callsAnswered: number;
  callsFailed: number;
  answerRate: number;
  concurrency: number;
  byStatus: Partial<Record<VoiceCampaignRecipientStatus, number>>;
}

export interface VoiceCampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  phone: string;
  status: VoiceCampaignRecipientStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  lastAttemptAt?: string;
  callId?: string;
  outcome?: string;
  failureReason?: string;
  createdAt: string;
}

export interface VoiceCampaign {
  id: string;
  name: string;
  status: VoiceCampaignStatus;
  fromNumber: string;
  script: string;
  contactListId?: string;
  agentId?: string;
  concurrency: number;
  maxAttempts: number;
  retryDelayMinutes: number;
  callingHoursStart?: string;
  callingHoursEnd?: string;
  timezone: string;
  totalContacts: number;
  callsMade: number;
  callsAnswered: number;
  callsFailed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoiceCampaignPayload {
  name: string;
  fromNumber: string;
  script: string;
  contactListId?: string;
  scheduledAt?: string;
  agentId?: string;
  concurrency?: number;
  maxAttempts?: number;
  retryDelayMinutes?: number;
  callingHoursStart?: string;
  callingHoursEnd?: string;
  timezone?: string;
  maxCalls?: number;
  objective?: string;
}

export const voiceCampaignService = {
  generateDraft: (payload: { objective: string; audienceDescription?: string }) =>
    api.post<{ data: { name: string; script: string } }>(
      '/voice/campaigns/generate-draft',
      payload,
    ),
  list: () => api.get<{ data: VoiceCampaign[] }>('/voice/campaigns'),
  get: (id: string) => api.get<{ data: VoiceCampaign }>(`/voice/campaigns/${id}`),
  create: (payload: CreateVoiceCampaignPayload) =>
    api.post<{ data: VoiceCampaign }>('/voice/campaigns', payload),
  remove: (id: string) => api.delete(`/voice/campaigns/${id}`),
  start: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/start`),
  pause: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/pause`),
  resume: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/resume`),
  cancel: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/cancel`),
  getStats: (id: string) => api.get<{ data: VoiceCampaignStats }>(`/voice/campaigns/${id}/stats`),
  listRecipients: (id: string, params?: { status?: VoiceCampaignRecipientStatus; page?: number }) =>
    api.get<{ data: { items: VoiceCampaignRecipient[]; total: number; page: number; limit: number } }>(
      `/voice/campaigns/${id}/recipients`,
      { params },
    ),
  retryRecipient: (id: string, recipientId: string) =>
    api.post<{ data: VoiceCampaignRecipient }>(
      `/voice/campaigns/${id}/recipients/${recipientId}/retry`,
    ),
  skipRecipient: (id: string, recipientId: string) =>
    api.post<{ data: VoiceCampaignRecipient }>(
      `/voice/campaigns/${id}/recipients/${recipientId}/skip`,
    ),
};
