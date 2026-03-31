import api from '../lib/api/client';

export const adminErrorLogsService = {
  getLogs: async (params: any) => {
    const response = await api.get('/admin/logs/errors', { params });
    return response.data;
  },
};
