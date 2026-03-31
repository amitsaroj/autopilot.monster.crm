import api from '../lib/api/client';

export const subAdminNotificationsService = {
  getTemplates: async () => {
    const response = await api.get('/sub-admin/notifications/templates');
    return response.data;
  },
  upsertTemplate: async (data: any) => {
    const response = await api.post('/sub-admin/notifications/templates', data);
    return response.data;
  },
};
