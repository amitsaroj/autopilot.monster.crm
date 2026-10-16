import api from '../lib/api/client';

export interface WhatsappTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components?: Record<string, unknown>;
  waTemplateId?: string;
  businessAccountId?: string;
  rejectionReason?: string;
}

export interface WhatsappTemplateHistory {
  id: string;
  templateId: string;
  source: string;
  actorId?: string | null;
  snapshot: Record<string, unknown>;
  createdAt: string;
}

export interface WhatsappTemplateImportResult {
  imported: number;
  unchanged: number;
  skippedUnsupported: number;
  conflicts: number;
}

export interface CreateWhatsappTemplatePayload {
  name: string;
  language: string;
  category: string;
  body: string;
  header?: string;
  footer?: string;
  bodyExamples?: string[];
  headerFormat?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  headerExample?: string;
  buttons?: TemplateButton[];
}

export type TemplateButton =
  | { type: 'QUICK_REPLY'; text: string }
  | { type: 'PHONE_NUMBER'; text: string; phone_number: string }
  | { type: 'URL'; text: string; url: string; example?: string[] }
  | { type: 'COPY_CODE'; example: string };

export function buildComponents(payload: CreateWhatsappTemplatePayload): Record<string, unknown> {
  const format = payload.headerFormat ?? 'TEXT';
  const items = [
    ...(format !== 'TEXT'
      ? [{ type: 'HEADER', format, example: { header_handle: [payload.headerExample ?? ''] } }]
      : payload.header
        ? [
            {
              type: 'HEADER',
              format,
              text: payload.header,
              ...(payload.header.includes('{{')
                ? { example: { header_text: [payload.headerExample ?? ''] } }
                : {}),
            },
          ]
        : []),
    {
      type: 'BODY',
      text: payload.body,
      ...(payload.bodyExamples?.length ? { example: { body_text: [payload.bodyExamples] } } : {}),
    },
    ...(payload.footer ? [{ type: 'FOOTER', text: payload.footer }] : []),
    ...(payload.buttons?.length ? [{ type: 'BUTTONS', buttons: payload.buttons }] : []),
  ];

  return { components: items };
}

export const whatsappTemplateService = {
  list: () => api.get<{ data: WhatsappTemplate[] }>('/whatsapp/templates'),
  get: (id: string) => api.get<{ data: WhatsappTemplate }>(`/whatsapp/templates/${id}`),
  history: (id: string) =>
    api.get<{ data: WhatsappTemplateHistory[] }>(`/whatsapp/templates/${id}/history`),
  create: (payload: CreateWhatsappTemplatePayload) =>
    api.post<{ data: WhatsappTemplate }>('/whatsapp/templates', {
      name: payload.name,
      language: payload.language,
      category: payload.category,
      components: buildComponents(payload),
    }),
  sync: (id: string, wabaId?: string) =>
    api.post<{ data: WhatsappTemplate }>(`/whatsapp/templates/${id}/sync`, { wabaId }),
  refresh: (id: string, wabaId?: string) =>
    api.post<{ data: WhatsappTemplate }>(`/whatsapp/templates/${id}/refresh`, { wabaId }),
  refreshAll: (wabaId?: string) => api.post('/whatsapp/templates/refresh', { wabaId }),
  importFromMeta: (wabaId: string) =>
    api.post<{ data: WhatsappTemplateImportResult }>('/whatsapp/templates/import', { wabaId }),
  update: (id: string, payload: CreateWhatsappTemplatePayload) =>
    api.patch<{ data: WhatsappTemplate }>(`/whatsapp/templates/${id}`, {
      name: payload.name,
      language: payload.language,
      category: payload.category,
      components: buildComponents(payload),
    }),
  remove: (id: string) => api.delete(`/whatsapp/templates/${id}`),
};
