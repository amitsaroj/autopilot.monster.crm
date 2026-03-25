import api from '../lib/api/client';

export const adminNotificationsService = {
  getAnnouncements: () => api.get('/admin/announcements'),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
  getHistory: () => api.get('/admin/notifications/history'),
  broadcast: (data: any) => api.post('/admin/notifications/broadcast', data),
};
