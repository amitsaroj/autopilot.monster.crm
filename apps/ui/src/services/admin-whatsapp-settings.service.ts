import api from '../lib/api/client';

export const adminWhatsAppSettingsService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings/whatsapp');
    return response.data;
  },
  updateSettings: async (settings: any) => {
    const response = await api.post('/admin/settings/whatsapp', settings);
    return response.data;
  },
};
