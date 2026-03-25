import api from '../lib/api/client';

export const adminUsersService = {
  findAll: async (params?: { search?: string; tenantId?: string }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
