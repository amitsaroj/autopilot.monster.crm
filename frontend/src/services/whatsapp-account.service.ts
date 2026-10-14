import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
export interface WhatsAppAccount {
  id: string;
  provider: 'meta';
  phoneNumberId: string;
  businessAccountId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  status: 'CONNECTED' | 'DISCONNECTED';
  validatedAt: string | null;
  apiVersion: string;
  capabilities: {
    text: boolean;
    template: boolean;
    media: boolean;
    interactive: boolean;
    flows: boolean;
    calling: boolean;
    groups: boolean;
  };
}
export interface AccountHealth {
  accountId: string;
  status: string;
  healthy: boolean;
  credentialsValid?: boolean;
  checkedAt: string;
  qualityRating?: string;
  codeVerificationStatus?: string;
}
export interface ConnectAccountInput {
  provider: 'meta';
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
}
export const whatsappAccountService = {
  list: async () => parseApiData<WhatsAppAccount[]>(await api.get('/whatsapp/accounts')) ?? [],
  connect: async (body: ConnectAccountInput) =>
    parseApiData<WhatsAppAccount>(await api.post('/whatsapp/accounts/connect', body)),
  health: async (id: string) =>
    parseApiData<AccountHealth>(
      await api.get(`/whatsapp/accounts/${encodeURIComponent(id)}/health`),
    ),
  disconnect: async (id: string) =>
    parseApiData<WhatsAppAccount>(
      await api.post(`/whatsapp/accounts/${encodeURIComponent(id)}/disconnect`),
    ),
};
