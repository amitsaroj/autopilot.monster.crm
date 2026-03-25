import api from '../lib/api/client';

export const adminIpWhitelistService = {
  getWhitelist: async () => {
    const response = await api.get('/admin/settings/ip-whitelist');
    return response.data;
  },
  addIp: async (data: { ip: string; description?: string }) => {
    const response = await api.post('/admin/settings/ip-whitelist', data);
    return response.data;
  },
  removeIp: async (ip: string) => {
    const response = await api.delete(`/admin/settings/ip-whitelist/${ip}`);
    return response.data;
  },
};
