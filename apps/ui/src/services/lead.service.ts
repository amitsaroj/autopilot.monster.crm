import api from '../lib/api/client';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
}

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  status: LeadStatus | string;
  score: number;
  aiSummary?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const leadService = {
  getLeads: () => api.get('/crm/leads'),
  getLead: (id: string) => api.get(`/crm/leads/${id}`),
  createLead: (data: Partial<Lead>) => api.post('/crm/leads', data),
  updateLead: (id: string, data: Partial<Lead>) => api.patch(`/crm/leads/${id}`, data),
  deleteLead: (id: string) => api.delete(`/crm/leads/${id}`),
  convertLead: (id: string) => api.post(`/crm/leads/${id}/convert`),
  bulkUpload: (leads: Partial<Lead>[]) => api.post('/crm/leads/bulk', leads),
};
