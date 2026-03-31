import api from '../lib/api/client';

export const subAdminRolesService = {
  getRoles: async () => {
    const response = await api.get('/sub-admin/roles');
    return response.data;
  },
  createRole: async (data: any) => {
    const response = await api.post('/sub-admin/roles', data);
    return response.data;
  },
  deleteRole: async (id: string) => {
    const response = await api.delete(`/sub-admin/roles/${id}`);
    return response.data;
  },
};
