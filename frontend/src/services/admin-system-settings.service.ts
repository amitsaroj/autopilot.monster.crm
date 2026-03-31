import api from '../lib/api/client';

export const adminSystemSettingsService = {
  getSettings: () => api.get('/admin/system-settings'),
  updateSettings: (settings: Record<string, any>) => api.post('/admin/system-settings', settings),
};
