import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface VoicePhoneNumber {
  id: string;
  phoneNumber: string;
  country: string;
  status: 'ACTIVE' | 'RELEASED' | 'PENDING';
  twilioSid?: string;
  capabilities: { voice: boolean; sms: boolean; mms: boolean };
  createdAt: string;
}

export const voicePhoneNumberService = {
  list: async () => {
    const res = await api.get('/voice/phone-numbers');
    return { data: { data: parseApiData<VoicePhoneNumber[]>(res) ?? [] } };
  },
  searchAvailable: (country: string, areaCode?: string) =>
    api.get('/voice/phone-numbers/available', { params: { country, areaCode } }),
  provision: (payload: { phoneNumber: string; country: string }) =>
    api.post('/voice/phone-numbers', payload),
  release: (id: string) => api.delete(`/voice/phone-numbers/${id}`),
};
