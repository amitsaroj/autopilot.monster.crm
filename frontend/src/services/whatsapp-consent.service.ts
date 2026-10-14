import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
export type ConsentScope = 'ALL' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export interface ConsentInput {
  phone: string;
  status: 'OPTED_IN' | 'OPTED_OUT';
  scope: ConsentScope;
  source: string;
  evidence?: string;
}
export interface ConsentRecord extends ConsentInput {
  id: string;
  createdAt: string;
  contactId?: string;
}
export interface WhatsappPreferences {
  phone: string;
  timezone: string | null;
  preferredLanguage: string | null;
  marketingEnabled: boolean;
}
export type WhatsappPreferencesInput = Partial<Omit<WhatsappPreferences, 'phone'>>;
export const whatsappConsentService = {
  list: async () => parseApiData<ConsentRecord[]>(await api.get('/whatsapp/consent')) ?? [],
  record: async (input: ConsentInput) =>
    parseApiData<ConsentRecord>(await api.post('/whatsapp/consent', input)),
  getPreferences: async (phone: string) =>
    parseApiData<WhatsappPreferences>(
      await api.get(`/whatsapp/consent/${encodeURIComponent(phone)}/preferences`),
    ),
  updatePreferences: async (phone: string, input: WhatsappPreferencesInput) =>
    parseApiData<WhatsappPreferences>(
      await api.patch(`/whatsapp/consent/${encodeURIComponent(phone)}/preferences`, input),
    ),
};
