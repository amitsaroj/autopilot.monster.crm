import api from '../lib/api/client';

export const adminBillingService = {
  getSettings: async () => {
    const response = await api.get('/admin/billing/settings');
    return response.data;
  },

  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/billing/settings', settings);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/billing/stats');
    return response.data;
  },
};
