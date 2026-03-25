import api from '../lib/api/client';

export const adminCostRulesService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/cost-rules');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/cost-rules', settings);
    return response.data;
  },
};
