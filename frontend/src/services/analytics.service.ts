import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

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

export interface PipelineStageStat {
  stage: string;
  count: number;
  value: number;
}

/** @deprecated Prefer PipelineStageStat */
export type PipelineStageAnalytics = PipelineStageStat;
export type PipelineData = PipelineStageStat;

export interface RevenueAnalytics {
  mrr: number;
  arr: number;
  wonDealCount: number;
}

export interface TeamMemberAnalytics {
  ownerId: string;
  deals: number;
  won: number;
  winRate: number;
  value: number;
}

export interface VoiceAnalytics {
  totalCalls: number;
  completedCalls: number;
  inboundCalls?: number;
  outboundCalls?: number;
  missedCalls?: number;
  averageDuration: number;
  totalCost?: number;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface WhatsappAnalytics {
  total: number;
  inbound: number;
  outbound: number;
}

export interface CrmAnalytics {
  contacts: number;
  leads: number;
  deals: number;
  conversionRate: number;
}

export interface AiUsageAnalytics {
  tokensUsed: number;
  messagesSent: number;
  totalCost: number;
  periodStart: string;
}

export interface AnalyticsSummary {
  totalContacts?: number;
  totalLeads?: number;
  totalDeals?: number;
  totalRevenue?: number;
  winRate?: number;
  revenue?: number;
}

export interface LeadFunnel {
  name?: string;
  stage: string;
  count: number;
  value?: number;
}

export interface ForecastSummary {
  totalPipeline: number;
  totalForecast: number;
  dealCount: number;
  onTrackCount: number;
  atRiskCount: number;
  currency: string;
}

export interface RoiReport {
  totalBudget: number;
  totalSpent: number;
  totalRevenue: number;
  netProfit: number;
  roiPercentage: number;
  campaignBreakdown: Array<{
    id: string;
    name: string;
    type: string;
    budget: number;
    spent: number;
    leads: number;
    qualified: number;
  }>;
  generatedAt: string;
}

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return parseApiData<AnalyticsOverview>(res);
  },
  getPipeline: async () => {
    const res = await api.get('/analytics/pipeline');
    return parseApiData<PipelineStageStat[]>(res) ?? [];
  },
  getPipelineStages: async () => analyticsService.getPipeline(),
  getRevenue: async () => {
    const res = await api.get('/analytics/revenue');
    return parseApiData<RevenueAnalytics>(res);
  },
  getTeam: async () => {
    const res = await api.get('/analytics/team');
    return parseApiData<TeamMemberAnalytics[]>(res) ?? [];
  },
  getVoice: async () => {
    const res = await api.get('/analytics/voice');
    return parseApiData<VoiceAnalytics>(res);
  },
  getWhatsapp: async () => {
    const res = await api.get('/analytics/whatsapp');
    return parseApiData<WhatsappAnalytics>(res);
  },
  getCrm: async () => {
    const res = await api.get('/analytics/crm');
    return parseApiData<CrmAnalytics>(res);
  },
  getAiUsage: async () => {
    const res = await api.get('/analytics/ai');
    return parseApiData<AiUsageAnalytics>(res);
  },
  getForecast: async (pipelineId?: string) => {
    const res = await api.get('/analytics/forecast', { params: { pipelineId } });
    return parseApiData<ForecastSummary>(res);
  },
  getRoi: async () => {
    const res = await api.get('/analytics/roi');
    return parseApiData<RoiReport>(res);
  },
  exportPdf: async (reportType: string) => {
    const res = await api.get('/analytics/export-pdf', {
      params: { reportType },
      responseType: 'blob',
    });
    return res.data as Blob;
  },
  getSummary: async () => {
    const res = await api.get('/analytics/overview');
    return res;
  },
  getLeads: async () => {
    const res = await api.get('/analytics/crm');
    return res;
  },
};
