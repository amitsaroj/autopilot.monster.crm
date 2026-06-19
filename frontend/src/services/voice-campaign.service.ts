import api from '../lib/api/client';

export type VoiceCampaignStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export interface VoiceCampaign {
  id: string;
  name: string;
  status: VoiceCampaignStatus;
  fromNumber: string;
  script: string;
  totalContacts: number;
  callsMade: number;
  callsAnswered: number;
  callsFailed: number;
  createdAt: string;
  updatedAt: string;
}

export const voiceCampaignService = {
  list: () => api.get<{ data: VoiceCampaign[] }>('/voice/campaigns'),
  get: (id: string) => api.get<{ data: VoiceCampaign }>(`/voice/campaigns/${id}`),
  create: (payload: Partial<VoiceCampaign>) =>
    api.post<{ data: VoiceCampaign }>('/voice/campaigns', payload),
  remove: (id: string) => api.delete(`/voice/campaigns/${id}`),
  start: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/start`),
  pause: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/pause`),
  resume: (id: string) => api.post<{ data: VoiceCampaign }>(`/voice/campaigns/${id}/resume`),
  getStats: (id: string) => api.get<{ data: Record<string, unknown> }>(`/voice/campaigns/${id}/stats`),
};
