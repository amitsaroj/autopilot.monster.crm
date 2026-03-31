import api from '../lib/api/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  avatarUrl?: string;
}

export const userService = {
  getUsers: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => api.patch(`/users/${id}`, data),
  inviteUser: (data: { email: string; roleId: string }) => api.post('/users/invite', data),
};
