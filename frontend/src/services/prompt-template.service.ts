import api from '../lib/api/client';

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  template: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export const promptTemplateService = {
  findAll: async (category?: string) => {
    const response = await api.get('/ai/templates', { params: { category } });
    return response.data;
  },
  findOne: async (id: string) => {
    const response = await api.get(`/ai/templates/${id}`);
    return response.data;
  },
  create: async (data: Partial<PromptTemplate>) => {
    const response = await api.post('/ai/templates', data);
    return response.data;
  },
  update: async (id: string, data: Partial<PromptTemplate>) => {
    const response = await api.patch(`/ai/templates/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete(`/ai/templates/${id}`);
    return response.data;
  },
  render: async (id: string, variables: Record<string, string>) => {
    const response = await api.post(`/ai/templates/${id}/render`, { variables });
    return response.data;
  },
};
