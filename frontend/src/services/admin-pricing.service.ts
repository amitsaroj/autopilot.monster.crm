import api from '../lib/api/client';

export const adminPricingService = {
  getSettings: async () => {
    const response = await api.get('/admin/pricing-settings');
    return response.data;
  },

  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/pricing-settings', settings);
    return response.data;
  },
};
