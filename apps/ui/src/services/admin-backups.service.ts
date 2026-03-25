import api from '../lib/api/client';

export const adminBackupsService = {
  findAll: async () => {
    const response = await api.get('/admin/backups');
    return response.data;
  },
  trigger: async () => {
    const response = await api.post('/admin/backups/trigger', {});
    return response.data;
  },
};
