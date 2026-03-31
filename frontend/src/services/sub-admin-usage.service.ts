import api from '../lib/api/client';

export const subAdminUsageService = {
  getUsageSummary: async () => {
    const response = await api.get('/sub-admin/usage/summary');
    return response.data;
  },
};
