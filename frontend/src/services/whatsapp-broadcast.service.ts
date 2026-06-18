import api from '../lib/api/client';

export interface WhatsappBroadcast {
  id: string;
  name: string;
  status: string;
  templateId?: string;
  recipientCount: number;
  sentCount: number;
  scheduledAt?: string;
  createdAt: string;
}

export const whatsappBroadcastService = {
  list: () => api.get<{ data: WhatsappBroadcast[] }>('/whatsapp/broadcasts'),
  get: (id: string) => api.get<{ data: WhatsappBroadcast }>(`/whatsapp/broadcasts/${id}`),
  create: (payload: { name: string; templateId: string; contactListId?: string }) =>
    api.post<{ data: WhatsappBroadcast }>('/whatsapp/broadcasts', payload),
  send: (id: string) => api.post(`/whatsapp/broadcasts/${id}/send`),
  remove: (id: string) => api.delete(`/whatsapp/broadcasts/${id}`),
};
