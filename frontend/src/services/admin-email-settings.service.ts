import api from '../lib/api/client';

export const adminEmailSettingsService = {
  getSettings: () => api.get('/admin/settings/email'),
  updateSettings: (settings: Record<string, any>) => api.post('/admin/settings/email', settings),
  sendTestEmail: (to: string) => api.post('/admin/settings/email/test', { to }),
};
