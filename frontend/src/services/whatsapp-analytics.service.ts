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
  csat: { responses: number; average: number | null };
  cost: null;
  revenueAttribution: null;
  averageResponseTimeMs: number;
  breached: number;
  campaigns: {
    summary: {
      count: number;
      recipients: number;
      sent: number;
      delivered: number;
      read: number;
      failed: number;
      statuses: Record<string, number>;
    };
    items: Array<{
      id: string;
      name: string;
      status: string;
      createdAt: string;
      total: number;
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    }>;
  };
  automationRuns: {
    summary: { count: number; statuses: Record<string, number> };
    items: Array<{
      id: string;
      flowId: string;
      workflowName: string;
      status: string;
      startedAt: string;
      completedAt: string | null;
      eventName: string | null;
    }>;
  };
}
export const whatsappAnalyticsService = {
  get: (from?: string, to?: string) =>
    api.get<{ data: WhatsappAnalytics }>('/whatsapp/analytics', { params: { from, to } }),
  read: async (from?: string, to?: string) =>
    parseApiData<WhatsappAnalytics>(await api.get('/whatsapp/analytics', { params: { from, to } })),
};
