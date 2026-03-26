import api from '../lib/api/client';

export const adminDebugService = {
  clearCache: async () => {
    const response = await api.post('/admin/debug/cache/clear');
    return response.data;
  },
  simulateError: async () => {
    const response = await api.post('/admin/debug/events/simulate-error');
    return response.data;
  },
  getEnv: async () => {
    const response = await api.get('/admin/debug/environment/safe');
    return response.data;
  },
};
