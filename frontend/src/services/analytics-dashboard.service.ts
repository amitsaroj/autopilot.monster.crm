import api from '../lib/api/client';

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Array<Record<string, unknown>>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const analyticsDashboardService = {
  list: () => api.get<{ data: AnalyticsDashboard[] }>('/analytics/dashboards'),
  get: (id: string) => api.get<{ data: AnalyticsDashboard }>(`/analytics/dashboards/${id}`),
  create: (payload: Partial<AnalyticsDashboard>) =>
    api.post<{ data: AnalyticsDashboard }>('/analytics/dashboards', payload),
  update: (id: string, payload: Partial<AnalyticsDashboard>) =>
    api.patch<{ data: AnalyticsDashboard }>(`/analytics/dashboards/${id}`, payload),
  remove: (id: string) => api.delete(`/analytics/dashboards/${id}`),
};
