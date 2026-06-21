import api from '../lib/api/client';

export interface WhatsappTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components?: Record<string, unknown>;
  waTemplateId?: string;
  rejectionReason?: string;
}

export interface CreateWhatsappTemplatePayload {
  name: string;
  language: string;
  category: string;
  body: string;
  header?: string;
  footer?: string;
}

function buildComponents(payload: CreateWhatsappTemplatePayload): Record<string, unknown> {
  const items = [
    ...(payload.header
      ? [{ type: 'HEADER', format: 'TEXT', text: payload.header }]
      : []),
    { type: 'BODY', text: payload.body },
    ...(payload.footer ? [{ type: 'FOOTER', text: payload.footer }] : []),
  ];

  return { components: items };
}

export const whatsappTemplateService = {
  list: () => api.get<{ data: WhatsappTemplate[] }>('/whatsapp/templates'),
  get: (id: string) => api.get<{ data: WhatsappTemplate }>(`/whatsapp/templates/${id}`),
  create: (payload: CreateWhatsappTemplatePayload) =>
    api.post<{ data: WhatsappTemplate }>('/whatsapp/templates', {
      name: payload.name,
      language: payload.language === 'en' ? 'en_US' : payload.language,
      category: payload.category,
      components: buildComponents(payload),
    }),
  sync: (id: string) => api.post(`/whatsapp/templates/${id}/sync`),
  remove: (id: string) => api.delete(`/whatsapp/templates/${id}`),
};
