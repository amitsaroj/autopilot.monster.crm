import api from '../lib/api/client';

export const adminAuditLogsService = {
  findAll: async (params?: { tenantId?: string; userId?: string; action?: string }) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};
