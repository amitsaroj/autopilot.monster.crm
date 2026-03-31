import api from '../lib/api/client';

export const adminPlanOverrideService = {
  getOverrides: async () => {
    const response = await api.get('/admin/settings/plan-overrides');
    return response.data;
  },
  updateOverrides: async (overrides: any) => {
    const response = await api.post('/admin/settings/plan-overrides', overrides);
    return response.data;
  },
};
