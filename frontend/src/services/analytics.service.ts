import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface AnalyticsSummary {
  totalDeals: number;
  totalRevenue: number;
  totalLeads: number;
  totalContacts: number;
  winRate: number;
}

export interface PipelineData {
  name: string;
  value: number;
  amount: number;
}

export interface LeadFunnel {
  name: string;
  count: number;
}

export interface AnalyticsOverview {
  contacts: number;
  leads: number;
  openDeals: number;
  wonDeals: number;
  pipelineValue: number;
  wonValue: number;
  calls: number;
  whatsappMessages: number;
}

export interface CrmAnalytics {
  contacts: number;
  leads: number;
  deals: number;
  conversionRate: number;
}

export interface RevenueAnalytics {
  mrr: number;
  arr: number;
  wonDealCount: number;
}

export interface PipelineStageAnalytics {
  stage: string;
  count: number;
  value: number;
}

export interface TeamMemberAnalytics {
  ownerId: string;
  deals: number;
  won: number;
  value: number;
  winRate: number;
}

export interface VoiceAnalytics {
  totalCalls: number;
  completedCalls: number;
  averageDuration: number;
}

export interface WhatsappAnalytics {
  total: number;
  inbound: number;
  outbound: number;
}

export interface AiUsageAnalytics {
  tokensUsed: number;
  messagesSent: number;
  totalCost: number;
  periodStart: string;
}

export const analyticsService = {
  getSummary: () => api.get('/crm/analytics/summary'),
  getPipeline: () => api.get('/crm/analytics/pipeline'),
  getLeads: () => api.get('/crm/analytics/leads'),

  getOverview: async () => parseApiData<AnalyticsOverview>(await api.get('/analytics/overview')),
  getCrm: async () => parseApiData<CrmAnalytics>(await api.get('/analytics/crm')),
  getRevenue: async () => parseApiData<RevenueAnalytics>(await api.get('/analytics/revenue')),
  getPipelineStages: async () =>
    parseApiData<PipelineStageAnalytics[]>(await api.get('/analytics/pipeline')),
  getTeam: async () => parseApiData<TeamMemberAnalytics[]>(await api.get('/analytics/team')),
  getVoice: async () => parseApiData<VoiceAnalytics>(await api.get('/analytics/voice')),
  getWhatsapp: async () => parseApiData<WhatsappAnalytics>(await api.get('/analytics/whatsapp')),
  getAiUsage: async () => parseApiData<AiUsageAnalytics>(await api.get('/analytics/ai')),
  getForecast: async (pipelineId?: string) =>
    parseApiData<Record<string, unknown>>(await api.get('/analytics/forecast', { params: { pipelineId } })),
};
