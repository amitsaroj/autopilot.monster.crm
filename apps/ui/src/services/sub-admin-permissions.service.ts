import api from '../lib/api/client';

export const subAdminPermissionsService = {
  getPermissions: async () => {
    const response = await api.get('/sub-admin/permissions');
    return response.data;
  },
};
