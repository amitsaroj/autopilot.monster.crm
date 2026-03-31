import api from '../lib/api/client';

export const adminTenantOverrideService = {
  getOverrides: async (tenantId: string) => {
    const response = await api.get(`/admin/tenants/${tenantId}/overrides`);
    return response.data;
  },
  updateOverrides: async (tenantId: string, overrides: any) => {
    const response = await api.post(`/admin/tenants/${tenantId}/overrides`, overrides);
    return response.data;
  },
};
