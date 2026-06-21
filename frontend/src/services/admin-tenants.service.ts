import api from '../lib/api/client';

export const adminTenantsService = {
  findAll: async (params?: { search?: string; page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/admin/tenants', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/admin/tenants/${id}`);
    return response.data;
  },

  create: async (data: { name: string; slug: string }) => {
    const response = await api.post('/admin/tenants', data);
    return response.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.patch(`/admin/tenants/${id}`, data);
    return response.data;
  },

  suspend: async (id: string) => {
    const response = await api.post(`/admin/tenants/${id}/suspend`);
    return response.data;
  },

  activate: async (id: string) => {
    const response = await api.post(`/admin/tenants/${id}/activate`);
    return response.data;
  },

  remove: async (id: string) => {
    await api.delete(`/admin/tenants/${id}`);
  },

  getOverrides: async (id: string) => {
    const response = await api.get(`/admin/tenants/${id}/overrides`);
    return response.data;
  },

  updateOverrides: async (id: string, overrides: Record<string, unknown>) => {
    const response = await api.post(`/admin/tenants/${id}/overrides`, overrides);
    return response.data;
  },

  removeOverrides: async (id: string) => {
    await api.delete(`/admin/tenants/${id}/overrides`);
  },
};
