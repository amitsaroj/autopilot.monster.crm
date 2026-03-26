import api from '../lib/api/client';

export const subAdminPluginsService = {
  getPlugins: async () => {
    const response = await api.get('/sub-admin/plugins');
    return response.data;
  },
  enablePlugin: async (id: string) => {
    const response = await api.post(`/sub-admin/plugins/${id}/enable`);
    return response.data;
  },
  disablePlugin: async (id: string) => {
    const response = await api.delete(`/sub-admin/plugins/${id}`);
    return response.data;
  },
};
