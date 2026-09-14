import api from '../lib/api/client';

export const subAdminNotificationsService = {
  findAll: async () => {
    const response = await api.get('/sub-admin/notifications');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/sub-admin/notifications', data);
    return response.data;
  },
};
