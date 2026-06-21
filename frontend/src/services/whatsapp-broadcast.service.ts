import api from '../lib/api/client';

export interface WhatsappBroadcast {
  id: string;
  name: string;
  status: string;
  templateId?: string;
  total: number;
  sent: number;
  failed: number;
  scheduledAt?: string;
  createdAt: string;
}

export const whatsappBroadcastService = {
  list: () => api.get<{ data: WhatsappBroadcast[] }>('/whatsapp/broadcasts'),
  get: (id: string) => api.get<{ data: WhatsappBroadcast }>(`/whatsapp/broadcasts/${id}`),
  create: (payload: {
    name: string;
    templateId: string;
    contactFilter?: { tags?: string[]; status?: string[] };
    templateVariables?: Record<string, string>;
    scheduledAt?: string;
  }) => api.post<{ data: WhatsappBroadcast }>('/whatsapp/broadcasts', payload),
  send: (id: string) => api.post(`/whatsapp/broadcasts/${id}/send`),
  schedule: (id: string, scheduledAt: string) =>
    api.patch(`/whatsapp/broadcasts/${id}/schedule`, { scheduledAt }),
  remove: (id: string) => api.delete(`/whatsapp/broadcasts/${id}`),
};
