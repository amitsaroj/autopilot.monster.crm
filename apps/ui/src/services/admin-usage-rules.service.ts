import api from '../lib/api/client';

export const adminUsageRulesService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/usage-rules');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/usage-rules', settings);
    return response.data;
  },
};
