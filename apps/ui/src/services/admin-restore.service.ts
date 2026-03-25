import api from '../lib/api/client';

export const adminRestoreService = {
  initiate: async (backupId: string) => {
    const response = await api.post('/admin/restore/initiate', { backupId });
    return response.data;
  },
};
