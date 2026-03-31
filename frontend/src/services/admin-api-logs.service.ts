import api from '../lib/api/client';

export const adminApiLogsService = {
  findAll: async (params?: { tenantId?: string; method?: string; statusCode?: number }) => {
    const response = await api.get('/admin/api-logs', { params });
    return response.data;
  },
};
