import api from '../lib/api/client';

export const adminLimitsService = {
  findAll: async () => {
    const response = await api.get('/admin/limits');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/limits', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/limits/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/limits/${id}`);
    return response.data;
  },
};
