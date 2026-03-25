import api from '../lib/api/client';

export const adminHealthService = {
  getHealth: async () => {
    const response = await api.get('/admin/health');
    return response.data;
  },
};
