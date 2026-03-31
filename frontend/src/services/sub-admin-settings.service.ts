import api from '../lib/api/client';

export const subAdminSettingsService = {
  getSettings: async () => {
    const response = await api.get('/sub-admin/settings');
    return response.data;
  },
  updateSettings: async (data: any) => {
    const response = await api.patch('/sub-admin/settings', data);
    return response.data;
  },
};
