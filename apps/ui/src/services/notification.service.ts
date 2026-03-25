import api from '../lib/api/client';

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};
