import api from '../lib/api/client';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

export const rbacService = {
  getPermissions: () => api.get('/rbac/permissions'),
  createPermission: (data: { name: string; resource: string; action: string; description?: string }) => 
    api.post('/rbac/permissions', data),
  getRoles: () => api.get('/rbac/roles'),
  getRole: (id: string) => api.get(`/rbac/roles/${id}`),
  createRole: (data: { name: string; description?: string; permissionIds: string[] }) => 
    api.post('/rbac/roles', data),
  updateRole: (id: string, data: Partial<{ name: string; description?: string; permissionIds: string[] }>) => 
    api.patch(`/rbac/roles/${id}`, data),
  deleteRole: (id: string) => api.delete(`/rbac/roles/${id}`),
  assignRole: (userId: string, roleId: string) => api.post('/rbac/assign', { userId, roleId }),
  revokeRole: (userId: string, roleId: string) => api.post('/rbac/revoke', { userId, roleId }),
};
