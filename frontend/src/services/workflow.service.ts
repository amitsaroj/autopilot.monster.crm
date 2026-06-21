import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

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
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface WorkflowTrigger {
  key: string;
  label: string;
  category?: string;
}

export const workflowService = {
  list: async () => {
    const res = await api.get('/workflows');
    return { data: { data: parseApiData<Workflow[]>(res) ?? [] } };
  },
  get: async (id: string) => {
    const res = await api.get(`/workflows/${id}`);
    return { data: { data: parseApiData<Workflow>(res) } };
  },
  create: async (payload: Partial<Workflow> & { definition: Record<string, unknown> }) => {
    const res = await api.post('/workflows', payload);
    return { data: { data: parseApiData<Workflow>(res) } };
  },
  update: async (id: string, payload: Partial<Workflow>) => {
    const res = await api.patch(`/workflows/${id}`, payload);
    return { data: { data: parseApiData<Workflow>(res) } };
  },
  remove: (id: string) => api.delete(`/workflows/${id}`),
  activate: (id: string) => api.post(`/workflows/${id}/activate`),
  deactivate: (id: string) => api.post(`/workflows/${id}/deactivate`),
  duplicate: (id: string) => api.post(`/workflows/${id}/duplicate`),
  getExecutions: async () => {
    const res = await api.get('/workflows/executions');
    return { data: { data: parseApiData<WorkflowExecution[]>(res) ?? [] } };
  },
  getExecution: async (execId: string) => {
    const res = await api.get(`/workflows/executions/${execId}`);
    return { data: { data: parseApiData<WorkflowExecution>(res) } };
  },
  getTriggers: async () => {
    const res = await api.get('/workflows/workflow-triggers');
    return { data: { data: parseApiData<WorkflowTrigger[]>(res) ?? [] } };
  },
  getActions: async () => {
    const res = await api.get('/workflows/workflow-actions');
    return { data: { data: parseApiData<WorkflowTrigger[]>(res) ?? [] } };
  },
  retryExecution: async (execId: string) => {
    const res = await api.post(`/workflows/executions/${execId}/retry`);
    return { data: { data: parseApiData<{ jobId: string; executionId: string }>(res) } };
  },
};
