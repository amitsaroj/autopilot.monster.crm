import api from '../lib/api/client';

export const adminRolesService = {
  findAll: async () => {
    const response = await api.get('/admin/roles');
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/admin/roles/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/roles', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/roles/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
  },
};
