import api from '../lib/api/client';

export const adminLogsViewerService = {
  getUnifiedLogs: async (params: any) => {
    const response = await api.get('/admin/logs-viewer/unified', { params });
    return response.data;
  },
  findAll: async (params: any) => {
    const response = await api.get('/admin/logs-viewer/unified', { params });
    return response.data;
  },
};
