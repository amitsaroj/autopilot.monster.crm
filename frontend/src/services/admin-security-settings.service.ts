import api from '../lib/api/client';

export const adminSecuritySettingsService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/security');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/security', settings);
    return response.data;
  },
};
