import api from './lib/api/client';

export const adminSmsSettingsService = {
  getSettings: () => api.get('/admin/sms-settings'),
  updateSettings: (settings: Record<string, any>) => api.post('/admin/sms-settings', settings),
};
