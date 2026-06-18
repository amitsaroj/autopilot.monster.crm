import api from '../lib/api/client';

export interface VoiceCampaign {
  id: string;
  name: string;
  status: string;
  fromNumber: string;
  script: string;
  totalContacts: number;
  callsMade: number;
  callsAnswered: number;
  callsFailed: number;
  scheduledAt?: string;
  startedAt?: string;
}

export interface CreateVoiceCampaignPayload {
  name: string;
  fromNumber: string;
  script: string;
  contactListId?: string;
  scheduledAt?: string;
  totalContacts?: number;
}

export const voiceCampaignService = {
  list: () => api.get<{ data: VoiceCampaign[] }>('/voice/campaigns'),
  get: (id: string) => api.get<{ data: VoiceCampaign }>(`/voice/campaigns/${id}`),
  create: (payload: CreateVoiceCampaignPayload) =>
    api.post<{ data: VoiceCampaign }>('/voice/campaigns', payload),
  start: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/start`),
  pause: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/pause`),
  resume: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/resume`),
  stats: (id: string) => api.get(`/voice/campaigns/${id}/stats`),
};
