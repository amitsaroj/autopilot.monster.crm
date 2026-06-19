import api from '../lib/api/client';

export interface WhatsappAnalytics {
  total: number;
  inbound: number;
  outbound: number;
}

export const whatsappAnalyticsService = {
  get: () => api.get<{ data: WhatsappAnalytics }>('/analytics/whatsapp'),
};
