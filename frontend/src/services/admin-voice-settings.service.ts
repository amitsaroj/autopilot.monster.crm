import api from '../lib/api/client';

export const adminVoiceSettingsService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/voice');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/voice', settings);
    return response.data;
  },
};
