import api from '../lib/api/client';

export const adminStorageService = {
  getStats: async () => {
    const response = await api.get('/admin/storage/stats');
    return response.data;
  },
};
