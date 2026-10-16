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
export interface SuppressedConsentPage {
  items: ConsentRecord[];
  total: number;
  page: number;
  limit: number;
}
export interface ReconsentInput {
  scope: ConsentScope;
  source: string;
  evidence: string;
  confirmGlobalOptOutOverride: boolean;
}
export interface WhatsappPreferences {
  phone: string;
  timezone: string | null;
  preferredLanguage: string | null;
  marketingEnabled: boolean;
  marketingConsentStatus: 'OPTED_IN' | 'OPTED_OUT' | 'UNKNOWN';
  suppressed: boolean;
}
export interface ContactSuppressionResult {
  updated: number;
}
export interface ConsentFilters {
  status?: ConsentInput['status'];
  scope?: ConsentScope;
  phone?: string;
  limit?: number;
}
export type WhatsappPreferencesInput = Partial<Omit<WhatsappPreferences, 'phone'>>;
export const whatsappConsentService = {
  list: async (filters: ConsentFilters = {}) =>
    parseApiData<ConsentRecord[]>(await api.get('/whatsapp/consent', { params: filters })) ?? [],
  listSuppressed: async (page: number, limit = 10) =>
    parseApiData<SuppressedConsentPage>(
      await api.get('/whatsapp/consent/suppressed', { params: { page, limit } }),
    ),
  reconsent: async (phone: string, input: ReconsentInput) =>
    parseApiData<ConsentRecord>(
      await api.post(`/whatsapp/consent/${encodeURIComponent(phone)}/re-consent`, input),
    ),
  record: async (input: ConsentInput) =>
    parseApiData<ConsentRecord>(await api.post('/whatsapp/consent', input)),
  importRecords: async (records: ConsentInput[]) =>
    parseApiData<ConsentRecord[]>(await api.post('/whatsapp/consent/import', { records })),
  getPreferences: async (phone: string) =>
    parseApiData<WhatsappPreferences>(
      await api.get(`/whatsapp/consent/${encodeURIComponent(phone)}/preferences`),
    ),
  updatePreferences: async (phone: string, input: WhatsappPreferencesInput) =>
    parseApiData<WhatsappPreferences>(
      await api.patch(`/whatsapp/consent/${encodeURIComponent(phone)}/preferences`, input),
    ),
  setContactSuppression: async (contactIds: string[], doNotContact: boolean) =>
    parseApiData<ContactSuppressionResult>(
      await api.post('/whatsapp/consent/contact-suppression', { contactIds, doNotContact }),
    ),
};
