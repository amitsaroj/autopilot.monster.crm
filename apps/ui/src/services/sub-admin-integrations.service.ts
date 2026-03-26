import api from '../lib/api/client';

export const subAdminIntegrationsService = {
  getIntegrations: async () => {
    const response = await api.get('/sub-admin/integrations');
    return response.data;
  },
  upsertIntegration: async (data: any) => {
    const response = await api.post('/sub-admin/integrations', data);
    return response.data;
  },
  deleteIntegration: async (id: string) => {
    const response = await api.delete(`/sub-admin/integrations/${id}`);
    return response.data;
  },
};
