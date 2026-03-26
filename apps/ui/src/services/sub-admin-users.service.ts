import api from '../lib/api/client';

export const subAdminUsersService = {
  getUsers: async () => {
    const response = await api.get('/sub-admin/users');
    return response.data;
  },
  inviteUser: async (data: any) => {
    const response = await api.post('/sub-admin/users/invite', data);
    return response.data;
  },
  removeUser: async (id: string) => {
    const response = await api.delete(`/sub-admin/users/${id}`);
    return response.data;
  },
};
