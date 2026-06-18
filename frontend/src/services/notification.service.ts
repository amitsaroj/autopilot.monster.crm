import api from '../lib/api/client';

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getPreferences: () => api.get<{ data: NotificationPreferences }>('/notifications/preferences'),
  updatePreferences: (prefs: Partial<NotificationPreferences>) =>
    api.patch<{ data: NotificationPreferences }>('/notifications/preferences', prefs),
};

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}
