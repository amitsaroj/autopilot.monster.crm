import api from '../lib/api/client';

export const adminPluginsService = {
  findAll: async () => {
    const response = await api.get('/admin/plugins');
    return response.data;
  },
};
