import api from '../lib/api/client';

export interface VoiceCall {
  id: string;
  sid: string;
  from: string;
  to: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  durationSeconds: number;
  recordingUrl?: string;
  transcript?: string;
  aiSummary?: string;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  voiceProfile?: string;
  costAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceCallSummary {
  summary: string | null;
  sentiment: VoiceCall['sentiment'] | null;
}

export const voiceCallService = {
  list: () => api.get<{ data: VoiceCall[] }>('/voice/calls'),
  get: (id: string) => api.get<{ data: VoiceCall }>(`/voice/calls/${id}`),
  initiate: (payload: { to: string; agentId?: string; leadId?: string; voice?: string }) =>
    api.post<{ data: VoiceCall }>('/voice/calls', payload),
  hangUp: (id: string) => api.delete(`/voice/calls/${id}/hang-up`),
  transfer: (id: string, to: string) =>
    api.post<{ data: VoiceCall }>(`/voice/calls/${id}/transfer`, { to }),
  getRecording: (id: string) => api.get<{ data: { url: string } }>(`/voice/calls/${id}/recording`),
  getTranscript: (id: string) =>
    api.get<{ data: { transcript: string } }>(`/voice/calls/${id}/transcript`),
  getSummary: (id: string) => api.get<{ data: VoiceCallSummary }>(`/voice/calls/${id}/summary`),
};
