import api from '../lib/api/client';

export const adminAISettingsService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/ai');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/ai', settings);
    return response.data;
  },
};
