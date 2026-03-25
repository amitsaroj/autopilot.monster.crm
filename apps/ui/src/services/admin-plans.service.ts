import api from '../lib/api/client';

export const adminPlansService = {
  findAll: async () => {
    const response = await api.get('/monetization/plans');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/monetization/admin/plans', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/monetization/admin/plans/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/monetization/admin/plans/${id}`);
    return response.data;
  },

  // Features
  addFeature: async (planId: string, data: any) => {
    const response = await api.post(`/monetization/admin/plans/${planId}/features`, data);
    return response.data;
  },

  updateFeature: async (id: string, data: any) => {
    const response = await api.patch(`/monetization/admin/features/${id}`, data);
    return response.data;
  },

  removeFeature: async (id: string) => {
    const response = await api.delete(`/monetization/admin/features/${id}`);
    return response.data;
  },

  // Limits
  addLimit: async (planId: string, data: any) => {
    const response = await api.post(`/monetization/admin/plans/${planId}/limits`, data);
    return response.data;
  },

  updateLimit: async (id: string, data: any) => {
    const response = await api.patch(`/monetization/admin/limits/${id}`, data);
    return response.data;
  },

  removeLimit: async (id: string) => {
    const response = await api.delete(`/monetization/admin/limits/${id}`);
    return response.data;
  },
};
