import api from '../lib/api/client';

export interface VoiceTranscript {
  id: string;
  sid: string;
  from: string;
  to: string;
  direction: string;
  status: string;
  durationSeconds: number;
  transcript?: string;
  createdAt: string;
}

export const voiceTranscriptService = {
  list: () => api.get<{ data: VoiceTranscript[] }>('/voice/transcripts'),
  get: (id: string) => api.get<{ data: VoiceTranscript }>(`/voice/transcripts/${id}`),
};
