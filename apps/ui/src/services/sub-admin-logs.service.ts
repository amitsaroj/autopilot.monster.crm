import api from '../lib/api/client';

export const subAdminLogsService = {
  getLogs: async (params: any) => {
    const response = await api.get('/sub-admin/logs', { params });
    return response.data;
  },
};
