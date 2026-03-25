import api from '../lib/api/client';

export const adminFeaturesService = {
  findAll: async () => {
    const response = await api.get('/admin/features');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/features', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/features/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/features/${id}`);
    return response.data;
  },
};
