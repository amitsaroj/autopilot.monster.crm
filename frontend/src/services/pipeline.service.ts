import api from '../lib/api/client';

export interface Stage {
  id: string;
  name: string;
  probability: number;
  sortOrder: number;
}

export interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  currency: string;
  stages: Stage[];
}

export const pipelineService = {
  getPipelines: () => api.get('/crm/pipelines'),
  getDefaultPipeline: () => api.get('/crm/pipelines/default'),
  createPipeline: (data: Partial<Pipeline>) => api.post('/crm/pipelines', data),
  createStage: (pipelineId: string, data: Partial<Stage>) => api.post(`/crm/pipelines/${pipelineId}/stages`, data),
};
