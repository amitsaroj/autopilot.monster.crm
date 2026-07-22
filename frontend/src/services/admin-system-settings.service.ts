import api from '../lib/api/client';

export const adminSystemSettingsService = {
  getSettings: () => api.get('/admin/settings/system'),
  updateSettings: (settings: Record<string, any>) => api.post('/admin/settings/system', settings),
};
