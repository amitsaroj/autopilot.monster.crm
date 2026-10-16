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
  qualityRating: string | null;
  messagingLimitTier: string | null;
  nameStatus: string | null;
  webhookSubscribed: boolean | null;
  lastHealthCheckAt: string | null;
  lastHealthError: string | null;
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
  credentialsValid?: boolean | null;
  checkedAt: string;
  error?: string | null;
  qualityRating?: string;
  codeVerificationStatus?: string;
  nameStatus?: string | null;
  messagingLimitTier?: string | null;
  webhookSubscribed?: boolean | null;
}
export type ConnectResult = WhatsAppAccount & { setupWarnings: string[] };
export interface EmbeddedSignupInput {
  code: string;
  businessAccountId: string;
  phoneNumberId: string;
  pin?: string;
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
    parseApiData<ConnectResult>(await api.post('/whatsapp/accounts/connect', body)),
  embeddedSignup: async (body: EmbeddedSignupInput) =>
    parseApiData<ConnectResult>(await api.post('/whatsapp/accounts/embedded-signup', body)),
  uploadMedia: async (
    phoneNumberId: string,
    type: 'image' | 'video' | 'audio' | 'document',
    file: File,
  ) => {
    const form = new FormData();
    form.append('file', file);
    return parseApiData<{ mediaId: string; mimeType: string; filename: string }>(
      await api.post(
        `/whatsapp/accounts/media/${encodeURIComponent(phoneNumberId)}?type=${encodeURIComponent(type)}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      ),
    );
  },
  health: async (id: string) =>
    parseApiData<AccountHealth>(
      await api.get(`/whatsapp/accounts/${encodeURIComponent(id)}/health`),
    ),
  disconnect: async (id: string) =>
    parseApiData<WhatsAppAccount>(
      await api.post(`/whatsapp/accounts/${encodeURIComponent(id)}/disconnect`),
    ),
};
