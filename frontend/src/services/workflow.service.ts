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

export interface WorkflowSequencePolicy {
  stopOnReply?: boolean;
  stopOnConversion?: boolean;
  businessHours?: {
    timezone: string;
    startHour: number;
    endHour: number;
    days: number[];
    useRecipientTimezone?: boolean;
  };
  exitCondition?: { field: string; operator?: string; value?: unknown };
}

export interface WorkflowExecution {
  id: string;
  flowId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  pauseReason?: string | null;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface WorkflowTrigger {
  key: string;
  label: string;
  category?: string;
}

export interface WorkflowPreview {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  preview?: { stepId: string; type: string; config: Record<string, unknown>; passed?: boolean }[];
}

export const workflowService = {
  preview: async (definition: Record<string, unknown>, payload: Record<string, unknown>) =>
    parseApiData<WorkflowPreview>(await api.post('/workflows/preview', { definition, payload })),
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
  controlExecution: async (execId: string, action: 'pause' | 'resume' | 'cancel') =>
    parseApiData<WorkflowExecution>(await api.post(`/workflows/executions/${execId}/${action}`)),
};
