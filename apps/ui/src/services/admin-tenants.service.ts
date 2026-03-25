import api from '../lib/api/client';

export const adminTenantsService = {
  findAll: async (params?: { search?: string }) => {
    const response = await api.get('/admin/tenants', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/admin/tenants/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/admin/tenants', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/tenants/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/tenants/${id}`);
    return response.data;
  },
  
  getOverrides: async (id: string) => {
    const response = await api.get(`/admin/tenants/${id}/overrides`);
    return response.data;
  },

  updateOverrides: async (id: string, overrides: any) => {
    const response = await api.post(`/admin/tenants/${id}/overrides`, overrides);
    return response.data;
  },

  removeOverrides: async (id: string) => {
    const response = await api.delete(`/admin/tenants/${id}/overrides`);
    return response.data;
  },
};
