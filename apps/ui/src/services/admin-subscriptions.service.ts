import api from '../lib/api/client';

export const adminSubscriptionsService = {
  findAll: async (params?: { tenantId?: string; status?: string }) => {
    const response = await api.get('/monetization/admin/subscriptions', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get(`/monetization/admin/subscriptions/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/subscriptions/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/subscriptions/${id}`);
    return response.data;
  },
};
