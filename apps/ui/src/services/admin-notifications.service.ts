import api from './lib/api/client';

export const adminNotificationsService = {
  // Announcements (Banners/Global Messages)
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data: { title: string; content: string; type?: string; expiresAt?: Date }) => 
    api.post('/admin/announcements', data),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),

  // Broadcasts (Direct Notifications to users)
  getBroadcastHistory: () => api.get('/admin/notifications/history'),
  sendBroadcast: (data: { title: string; message: string; type?: string }) => 
    api.post('/admin/notifications/broadcast', data),
};
