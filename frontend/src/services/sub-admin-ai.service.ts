import api from '../lib/api/client';

export const subAdminAiService = {
  getConfigs: async () => {
    const response = await api.get('/sub-admin/ai/configs');
    return response.data;
  },
  updateConfig: async (data: any) => {
    const response = await api.post('/sub-admin/ai/configs', data);
    return response.data;
  },
};
