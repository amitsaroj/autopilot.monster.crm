import api from '../lib/api/client';

export const adminRateLimitService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/rate-limit');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/rate-limit', settings);
    return response.data;
  },
};
