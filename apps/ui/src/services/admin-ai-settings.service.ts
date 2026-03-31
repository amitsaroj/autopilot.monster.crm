import api from '../lib/api/client';

export const adminAiSettingsService = {
  getEnv: async () => {
    const response = await api.get('/admin/settings/ai');
    return response.data;
  },
  getSettings: async () => {
    const response = await api.get('/admin/settings/ai');
    return response.data;
  },
  findAll: async () => {
    const response = await api.get('/admin/settings/ai');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/ai', settings);
    return response.data;
  },
};
