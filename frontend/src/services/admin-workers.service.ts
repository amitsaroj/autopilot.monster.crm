import api from '../lib/api/client';

export const adminWorkersService = {
  getStatus: async () => {
    const response = await api.get('/admin/workers/status');
    return response.data;
  },
};
