import api from '../lib/api/client';

export interface WhatsappTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  body: string;
  header?: string;
  footer?: string;
}

export interface CreateWhatsappTemplatePayload {
  name: string;
  language: string;
  category: string;
  body: string;
  header?: string;
  footer?: string;
}

export const whatsappTemplateService = {
  list: () => api.get<{ data: WhatsappTemplate[] }>('/whatsapp/templates'),
  get: (id: string) => api.get<{ data: WhatsappTemplate }>(`/whatsapp/templates/${id}`),
  create: (payload: CreateWhatsappTemplatePayload) =>
    api.post<{ data: WhatsappTemplate }>('/whatsapp/templates', payload),
  sync: (id: string) => api.post(`/whatsapp/templates/${id}/sync`),
  remove: (id: string) => api.delete(`/whatsapp/templates/${id}`),
};
