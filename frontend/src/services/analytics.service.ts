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
  getRoiReport: () => api.get('/analytics/roi'),
  getAiVsHumanReport: () => api.get('/analytics/ai-vs-human'),
  downloadPdf: async (reportType: string) => {
    const response = await api.get(`/analytics/export-pdf?reportType=${reportType}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${reportType}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
