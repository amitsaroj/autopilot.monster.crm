import api from '../lib/api/client';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  voice: string;
  systemPrompt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const aiAgentService = {
  list: () => api.get<{ data: Agent[] }>('/ai/agents'),
  get: (id: string) => api.get<{ data: Agent }>(`/ai/agents/${id}`),
  create: (payload: Partial<Agent>) => api.post<{ data: Agent }>('/ai/agents', payload),
  remove: (id: string) => api.delete(`/ai/agents/${id}`),
  activate: (id: string) => api.post(`/ai/agents/${id}/activate`),
  pause: (id: string) => api.post(`/ai/agents/${id}/pause`),
};
