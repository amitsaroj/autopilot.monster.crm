import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';

export type ShopifyWebhookStatus = 'READY' | 'DEGRADED' | 'NOT_CONFIGURED' | null;

export interface ShopifyIntegrationStatus {
  configured: boolean;
  connected: boolean;
  shop: string | null;
  scopes: string[];
  webhookStatus: ShopifyWebhookStatus;
  lastError: string | null;
}

export interface ShopifyConnectResult {
  authorizationUrl: string;
}

export interface ShopifyDisconnectResult {
  disconnected: true;
}

export interface ShopifyWebhookSyncResult {
  webhookStatus: 'READY' | 'DEGRADED';
}

export const shopifyIntegrationService = {
  status: async () =>
    parseApiData<ShopifyIntegrationStatus>(await api.get('/integrations/shopify/status')),
  connect: async (shop: string) =>
    parseApiData<ShopifyConnectResult>(await api.post('/integrations/shopify/connect', { shop })),
  disconnect: async () =>
    parseApiData<ShopifyDisconnectResult>(await api.post('/integrations/shopify/disconnect')),
  syncWebhooks: async () =>
    parseApiData<ShopifyWebhookSyncResult>(await api.post('/integrations/shopify/sync-webhooks')),
};
