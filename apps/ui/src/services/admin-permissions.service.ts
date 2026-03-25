import api from '../lib/api/client';

export const adminPermissionsService = {
  findAll: async () => {
    const response = await api.get('/admin/permissions');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/permissions', data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/permissions/${id}`);
    return response.data;
  },
};
