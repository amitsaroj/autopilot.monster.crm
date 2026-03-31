import api from '../lib/api/client';

export const adminIntegrationsService = {
  findAll: async () => {
    const response = await api.get('/admin/integrations');
    return response.data;
  },
  updateConfig: async (id: string, config: any) => {
    const response = await api.post(`/admin/integrations/${id}/config`, config);
    return response.data;
  },
};
