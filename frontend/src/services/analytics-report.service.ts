import api from '../lib/api/client';

export type AnalyticsReportType =
  | 'OVERVIEW'
  | 'CRM'
  | 'REVENUE'
  | 'PIPELINE'
  | 'TEAM'
  | 'VOICE'
  | 'WHATSAPP'
  | 'AI'
  | 'FORECAST';

export type AnalyticsReportStatus = 'DRAFT' | 'READY' | 'RUNNING' | 'FAILED';

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  reportType: AnalyticsReportType;
  filters: Record<string, unknown>;
  schedule?: Record<string, unknown>;
  status: AnalyticsReportStatus;
  lastRunAt?: string;
  lastResults?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const analyticsReportService = {
  list: () => api.get<{ data: AnalyticsReport[] }>('/analytics/reports'),
  get: (id: string) => api.get<{ data: AnalyticsReport }>(`/analytics/reports/${id}`),
  create: (payload: Partial<AnalyticsReport>) =>
    api.post<{ data: AnalyticsReport }>('/analytics/reports', payload),
  update: (id: string, payload: Partial<AnalyticsReport>) =>
    api.patch<{ data: AnalyticsReport }>(`/analytics/reports/${id}`, payload),
  remove: (id: string) => api.delete(`/analytics/reports/${id}`),
  run: (id: string) => api.post<{ data: AnalyticsReport }>(`/analytics/reports/${id}/run`),
  results: (id: string) => api.get<{ data: Record<string, unknown> }>(`/analytics/reports/${id}/results`),
};
