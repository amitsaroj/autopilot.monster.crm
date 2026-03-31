import api from '../lib/api/client';

export const adminUserOverrideService = {
  getOverrides: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/overrides`);
    return response.data;
  },
  updateOverrides: async (userId: string, overrides: any) => {
    const response = await api.post(`/admin/users/${userId}/overrides`, overrides);
    return response.data;
  },
};
