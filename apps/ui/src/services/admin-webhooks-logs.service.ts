import api from '../lib/api/client';

export const adminWebhooksLogsService = {
  findAll: async (params?: { tenantId?: string; webhookId?: string; status?: string }) => {
    const response = await api.get('/admin/webhooks-logs', { params });
    return response.data;
  },
};
