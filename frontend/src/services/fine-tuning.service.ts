import api from '../lib/api/client';

export interface FineTuningJob {
  id: string;
  name: string;
  baseModel: string;
  fineTunedModel?: string;
  status: string;
  datasetFileKey?: string;
  hyperparameters: Record<string, unknown>;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export const fineTuningService = {
  list: () => api.get<{ data: FineTuningJob[] }>('/ai/fine-tuning'),
  get: (id: string) => api.get<{ data: FineTuningJob }>(`/ai/fine-tuning/${id}`),
  create: (payload: { name: string; baseModel: string; datasetFileKey?: string }) =>
    api.post<{ data: FineTuningJob }>('/ai/fine-tuning', payload),
  cancel: (id: string) => api.post<{ data: FineTuningJob }>(`/ai/fine-tuning/${id}/cancel`),
  remove: (id: string) => api.delete(`/ai/fine-tuning/${id}`),
};
