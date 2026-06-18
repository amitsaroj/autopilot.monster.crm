import api from '../lib/api/client';

export interface Workflow {
  id: string;
  name: string;
  type: 'voice' | 'whatsapp';
  definition: Record<string, unknown>;
  isPublished: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  flowId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export const workflowService = {
  list: () => api.get<{ data: Workflow[] }>('/workflows'),
  get: (id: string) => api.get<{ data: Workflow }>(`/workflows/${id}`),
  create: (payload: Partial<Workflow>) => api.post<{ data: Workflow }>('/workflows', payload),
  update: (id: string, payload: Partial<Workflow>) =>
    api.patch<{ data: Workflow }>(`/workflows/${id}`, payload),
  remove: (id: string) => api.delete(`/workflows/${id}`),
  activate: (id: string) => api.post(`/workflows/${id}/activate`),
  deactivate: (id: string) => api.post(`/workflows/${id}/deactivate`),
  getExecutions: () => api.get<{ data: WorkflowExecution[] }>('/workflows/executions'),
  getExecution: (execId: string) =>
    api.get<{ data: WorkflowExecution }>(`/workflows/executions/${execId}`),
};
