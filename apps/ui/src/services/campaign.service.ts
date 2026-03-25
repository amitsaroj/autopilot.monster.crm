import api from '../lib/api/client';

export enum CampaignType {
  VOICE = 'VOICE',
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType | string;
  status: CampaignStatus | string;
  agentId?: string;
  totalLeads: number;
  completedLeads: number;
  qualifiedLeads: number;
  budget: number;
  spent: number;
  scheduledAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export const campaignService = {
  getCampaigns: () => api.get('/crm/campaigns'),
  getCampaign: (id: string) => api.get(`/crm/campaigns/${id}`),
  createCampaign: (data: Partial<Campaign>) => api.post('/crm/campaigns', data),
  updateCampaign: (id: string, data: Partial<Campaign>) => api.patch(`/crm/campaigns/${id}`, data),
  deleteCampaign: (id: string) => api.delete(`/crm/campaigns/${id}`),
};
