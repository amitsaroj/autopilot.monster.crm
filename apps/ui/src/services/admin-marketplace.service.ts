import api from '../lib/api/client';

export const adminMarketplaceService = {
  getPlugins: async () => {
    const response = await api.get('/admin/marketplace/plugins');
    return response.data;
  },

  createPlugin: async (data: any) => {
    const response = await api.post('/admin/marketplace/plugins', data);
    return response.data;
  },

  updatePlugin: async (id: string, data: any) => {
    const response = await api.put(`/admin/marketplace/plugins/${id}`, data);
    return response.data;
  },

  deletePlugin: async (id: string) => {
    const response = await api.delete(`/admin/marketplace/plugins/${id}`);
    return response.data;
  },

  getInstallations: async (id: string) => {
    const response = await api.get(`/admin/marketplace/plugins/${id}/installations`);
    return response.data;
  },
};
