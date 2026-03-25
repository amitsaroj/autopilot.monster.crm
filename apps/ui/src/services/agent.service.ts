import api from '../lib/api/client';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  voice: string;
  systemPrompt?: string;
  configuration?: any;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  role: string;
  category: string;
  prompt: string;
  capabilities: string[];
}

export const agentService = {
  getAgents: () => api.get('/crm/agents'),
  getAgent: (id: string) => api.get(`/crm/agents/${id}`),
  createAgent: (data: Partial<Agent>) => api.post('/crm/agents', data),
  updateAgent: (id: string, data: Partial<Agent>) => api.patch(`/crm/agents/${id}`, data),
  deleteAgent: (id: string) => api.delete(`/crm/agents/${id}`),
  
  // Templates
  getTemplates: () => api.get('/crm/agents/templates'),
  installTemplate: (id: string) => api.post(`/crm/agents/templates/${id}/install`, {}),
};
