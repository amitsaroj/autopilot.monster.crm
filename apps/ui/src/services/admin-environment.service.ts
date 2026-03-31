import api from '../lib/api/client';

export const adminEnvironmentService = {
  getEnv: () => api.get('/admin/environment'),
};
