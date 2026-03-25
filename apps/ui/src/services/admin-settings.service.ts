import api from '../lib/api/client';

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  group: string;
  createdAt: string;
  updatedAt: string;
}

export const adminSettingsService = {
  findAll: () => api.get('/admin/settings'),
  update: (key: string, value: any, group?: string) => 
    api.post(`/admin/settings/${key}`, { value, group }),
};
