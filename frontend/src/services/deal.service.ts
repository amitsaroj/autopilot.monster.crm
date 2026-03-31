import api from '../lib/api/client';

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  pipelineId: string;
  stageId: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  status: 'OPEN' | 'WON' | 'LOST';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  lostReason?: string;
  tags: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const dealService = {
  getDeals: () => api.get('/crm/deals'),
  getBoard: (pipelineId?: string) => api.get('/crm/deals/board', { params: { pipelineId } }),
  getDeal: (id: string) => api.get(`/crm/deals/${id}`),
  createDeal: (data: Partial<Deal>) => api.post('/crm/deals', data),
  updateDeal: (id: string, data: Partial<Deal>) => api.put(`/crm/deals/${id}`, data),
  deleteDeal: (id: string) => api.delete(`/crm/deals/${id}`),
};
