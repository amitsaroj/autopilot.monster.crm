import api from '../lib/api/client';

export const adminInternalService = {
  getSystemHealth: async () => {
    const response = await api.get('/admin/internal/system-health');
    return response.data;
  },
  getDbStatus: async () => {
    const response = await api.get('/admin/internal/database/status');
    return response.data;
  },
};
