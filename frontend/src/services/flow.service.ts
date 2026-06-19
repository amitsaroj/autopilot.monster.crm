import api from '../lib/api/client';

export interface Flow {
  id: string;
  name: string;
  type: 'voice' | 'whatsapp';
  definition: Record<string, unknown>;
  isPublished: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const flowService = {
  list: () => api.get<{ data: Flow[] }>('/crm/flows'),
  get: (id: string) => api.get<{ data: Flow }>(`/crm/flows/${id}`),
  create: (data: Partial<Flow>) => api.post<{ data: Flow }>('/crm/flows', data),
  update: (id: string, data: Partial<Flow>) => api.put<{ data: Flow }>(`/crm/flows/${id}`, data),
  remove: (id: string) => api.delete(`/crm/flows/${id}`),
};
