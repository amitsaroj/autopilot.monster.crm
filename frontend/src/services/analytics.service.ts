import api from '../lib/api/client';

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

export const analyticsService = {
  getSummary: () => api.get('/crm/analytics/summary'),
  getPipeline: () => api.get('/crm/analytics/pipeline'),
  getLeads: () => api.get('/crm/analytics/leads'),
};
