import api from '../lib/api/client';

export const crmReportService = {
  getSummary: () => api.get('/crm/reports/summary'),
  getPipeline: () => api.get('/crm/reports/pipeline'),
  getRevenueTrend: () => api.get('/crm/reports/revenue-trend'),
  getPerformance: () => api.get('/crm/reports/performance'),
  getLeadFunnel: () => api.get('/crm/reports/lead-funnel'),
};
