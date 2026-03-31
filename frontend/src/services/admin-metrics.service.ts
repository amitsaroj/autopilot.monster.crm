import api from '../lib/api/client';

export const adminMetricsService = {
  getStats: async () => {
    const response = await api.get('/admin/metrics/stats');
    return response.data;
  },
  getHealth: async () => {
    const response = await api.get('/admin/metrics/health');
    return response.data;
  },
};
