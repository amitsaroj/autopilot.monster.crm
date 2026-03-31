import api from '../lib/api/client';

export const tenantSettingsService = {
  getSettings: async () => {
    const response = await api.get('/settings/integrations');
    return response.data;
  },
  updateSetting: async (data: { key: string; value: any; group?: string }) => {
    const response = await api.post('/settings/integrations', data);
    return response.data;
  },
  deleteSetting: async (key: string) => {
    const response = await api.delete(`/settings/integrations/${key}`);
    return response.data;
  },
};
