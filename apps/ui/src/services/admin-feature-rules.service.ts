import api from '../lib/api/client';

export const adminFeatureRulesService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/feature-rules');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/feature-rules', settings);
    return response.data;
  },
};
