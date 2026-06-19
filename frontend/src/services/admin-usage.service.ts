import api from '../lib/api/client';

export const adminUsageService = {
  findAll: async (params?: { tenantId?: string; metric?: string }) => {
    const response = await api.get('/admin/usage', { params });
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/admin/usage/summary');
    return response.data;
  },
};
