import api from '../lib/api/client';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
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
}

export const developerSettingsService = {
  listApiKeys: () => api.get<{ data: ApiKey[] }>('/settings/api-keys'),
  createApiKey: (name: string, permissions?: string[]) =>
    api.post<{ data: ApiKey & { key: string } }>('/settings/api-keys', { name, permissions }),
  revokeApiKey: (id: string) => api.delete(`/settings/api-keys/${id}`),
  listWebhooks: () => api.get<{ data: WebhookEndpoint[] }>('/settings/webhooks'),
  createWebhook: (payload: { name: string; url: string; events: string[] }) =>
    api.post<{ data: WebhookEndpoint }>('/settings/webhooks', payload),
  deleteWebhook: (id: string) => api.delete(`/settings/webhooks/${id}`),
  testWebhook: (id: string) => api.post<{ data: { delivered: boolean; statusCode: number } }>(`/settings/webhooks/${id}/test`),
};
