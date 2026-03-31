import api from '../lib/api/client';

export const eventService = {
  getEvents: (params?: any) => api.get('/admin/audit-logs', { params }),
  getEvent: (id: string) => api.get(`/admin/audit-logs/${id}`),
};
