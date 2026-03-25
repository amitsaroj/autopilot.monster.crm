import api from '../lib/api/client';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'DELETED';
  planId?: string;
  customDomain?: string;
  branding?: any;
  createdAt: string;
  updatedAt: string;
}

export const tenantService = {
  // --- Workspace Settings ---
  getSettings: () => api.get('/settings/workspace'),
  updateSettings: (data: Partial<Tenant>) => api.patch('/settings/workspace', data),
  verifyDomain: (domain: string) => api.post('/settings/workspace/verify-domain', { domain }),
  updateBranding: (branding: any) => api.post('/settings/workspace/branding', branding),

  // --- Admin Methods ---
  getAllTenants: () => api.get('/admin/tenants'),
  getTenantById: (id: string) => api.get(`/admin/tenants/${id}`),
  createTenant: (data: any) => api.post('/admin/tenants', data),
  updateTenant: (id: string, data: any) => api.patch(`/admin/tenants/${id}`, data),
  suspendTenant: (id: string) => api.post(`/admin/tenants/${id}/suspend`),
  activateTenant: (id: string) => api.post(`/admin/tenants/${id}/activate`),
  deleteTenant: (id: string) => api.delete(`/admin/tenants/${id}`),
};
