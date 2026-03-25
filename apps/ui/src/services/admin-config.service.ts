import api from './lib/api/client';

export const adminConfigService = {
  findAll: () => api.get('/admin/config'),
  update: (data: { key: string; value: any; group?: string; isPublic?: boolean }) => 
    api.post('/admin/config', data),
  remove: (key: string) => api.delete(`/admin/config/${key}`),
};
