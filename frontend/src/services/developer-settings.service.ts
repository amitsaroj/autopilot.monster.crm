import api from '../lib/api/client';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  scopes?: string[];
  rateLimit?: number;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  replayOf?: string;
  event: string;
  payload: Record<string, unknown>;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  attempts: number;
  nextRetryAt?: string;
  createdAt: string;
}

export const developerSettingsService = {
  listApiKeys: () => api.get<{ data: ApiKey[] }>('/settings/api-keys'),
  createApiKey: (name: string, permissions: string[], rateLimit: number) =>
    api.post<{ data: ApiKey & { key: string } }>('/settings/api-keys', {
      name,
      permissions,
      rateLimit,
    }),
  revokeApiKey: (id: string) => api.delete(`/settings/api-keys/${id}`),
  listWebhooks: () => api.get<{ data: WebhookEndpoint[] }>('/developer/webhooks'),
  createWebhook: (payload: { name: string; url: string; events: string[] }) =>
    api.post<{ data: WebhookEndpoint & { secret: string } }>('/developer/webhooks', payload),
  updateWebhook: (id: string, payload: { status: 'ACTIVE' | 'INACTIVE' }) =>
    api.patch<{ data: WebhookEndpoint }>(`/developer/webhooks/${id}`, payload),
  deleteWebhook: (id: string) => api.delete(`/developer/webhooks/${id}`),
  testWebhook: (id: string) =>
    api.post<{ data: { success: boolean; status?: number } }>(`/developer/webhooks/${id}/test`),
  rotateWebhookSecret: (id: string) =>
    api.post<{ data: { secret: string } }>(`/developer/webhooks/${id}/rotate-secret`),
  getWebhookDeliveries: (id: string, page = 1, limit = 20) =>
    api.get<{ data: { data: WebhookDelivery[]; total: number } }>(
      `/developer/webhooks/${id}/deliveries`,
      { params: { page, limit } },
    ),
  replayWebhookDelivery: (id: string, deliveryId: string, idempotencyKey: string) =>
    api.post<{ data: WebhookDelivery }>(
      `/developer/webhooks/${id}/deliveries/${deliveryId}/replay`,
      undefined,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    ),
  listOAuthApps: () => api.get<{ data: OAuthApp[] }>('/settings/oauth-apps'),
  createOAuthApp: (payload: { name: string; redirectUris: string[]; scopes?: string[] }) =>
    api.post<{ data: OAuthApp & { clientSecret: string } }>('/settings/oauth-apps', payload),
  revokeOAuthApp: (id: string) => api.delete(`/settings/oauth-apps/${id}`),
};

export interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  clientSecretPrefix: string;
  redirectUris: string[];
  scopes: string[];
  isActive: boolean;
  createdAt: string;
}
