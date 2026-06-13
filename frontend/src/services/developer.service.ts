import api from '../lib/api/client';

export interface WebhookDto {
  id?: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  status?: string;
}

export interface OAuthAppDto {
  id?: string;
  name: string;
  description?: string;
  redirectUris: string[];
  scopes: string[];
  clientId?: string;
  clientSecret?: string;
}

export const developerService = {
  // Webhooks Management
  getWebhooks: () => api.get('/developer/webhooks'),
  getWebhook: (id: string) => api.get(`/developer/webhooks/${id}`),
  createWebhook: (dto: WebhookDto) => api.post('/developer/webhooks', dto),
  updateWebhook: (id: string, dto: Partial<WebhookDto>) => api.patch(`/developer/webhooks/${id}`, dto),
  deleteWebhook: (id: string) => api.delete(`/developer/webhooks/${id}`),
  testWebhook: (id: string) => api.post(`/developer/webhooks/${id}/test`),
  rotateWebhookSecret: (id: string) => api.post(`/developer/webhooks/${id}/rotate-secret`),
  getWebhookDeliveries: (id: string, page = 1, limit = 20) => 
    api.get(`/developer/webhooks/${id}/deliveries`, { params: { page, limit } }),

  // OAuth Applications Management
  getOAuthApps: () => api.get('/developer/oauth/apps'),
  getOAuthApp: (id: string) => api.get(`/developer/oauth/apps/${id}`),
  createOAuthApp: (dto: OAuthAppDto) => api.post('/developer/oauth/apps', dto),
  deleteOAuthApp: (id: string) => api.delete(`/developer/oauth/apps/${id}`),

  // API Usage Logs
  getApiLogs: (page = 1, limit = 20) => 
    api.get('/developer/logs', { params: { page, limit } }),
  getApiLogStats: () => api.get('/developer/logs/stats'),
};
