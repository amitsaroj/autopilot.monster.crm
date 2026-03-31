import api from '../lib/api/client';

export const adminFeatureFlagsService = {
  getGlobalFlags: async () => {
    const response = await api.get('/admin/feature-flags/global');
    return response.data;
  },

  updateGlobalFlag: async (data: { key: string; enabled: boolean }) => {
    const response = await api.post('/admin/feature-flags/global', data);
    return response.data;
  },

  getTenantFlags: async (tenantId: string) => {
    const response = await api.get(`/admin/feature-flags/tenant/${tenantId}`);
    return response.data;
  },

  updateTenantFlag: async (tenantId: string, data: { key: string; enabled: boolean }) => {
    const response = await api.patch(`/admin/feature-flags/tenant/${tenantId}`, data);
    return response.data;
  },
};
