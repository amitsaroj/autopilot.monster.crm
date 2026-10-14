import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
export interface WhatsappAnalytics {
  total: number;
  inbound: number;
  outbound: number;
  counts: Record<string, number>;
  submitted: number;
  delivered: number;
  read: number;
  failed: number;
  unknown: number;
  cost: null;
  revenueAttribution: null;
  averageResponseTimeMs: number;
  breached: number;
}
export const whatsappAnalyticsService = {
  get: () => api.get<{ data: WhatsappAnalytics }>('/whatsapp/analytics'),
  read: async () => parseApiData<WhatsappAnalytics>(await api.get('/whatsapp/analytics')),
};
