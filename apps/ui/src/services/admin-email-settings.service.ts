import api from './lib/api/client';

export const adminEmailSettingsService = {
  getSettings: () => api.get('/admin/email-settings'),
  updateSettings: (settings: Record<string, any>) => api.post('/admin/email-settings', settings),
  sendTestEmail: (to: string) => api.post('/admin/email-settings/test', { to }),
};
