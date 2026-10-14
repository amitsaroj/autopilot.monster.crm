import api from '../lib/api/client';

export interface BroadcastAudience {
  tags?: string[];
  status?: string[];
  segmentIds?: string[];
  customField?: { key: string; value: string };
  excludeTags?: string[];
  excludeContactIds?: string[];
  frequencyCap?: { maxMessages: number; windowHours: number };
  maxRecipients?: number;
}
export interface BroadcastPreview {
  recipientCount: number;
  eligible: number;
  blocked: number;
  limitExceeded: boolean;
  maxRecipients: number | null;
}
export interface BroadcastRecipient {
  contactId: string;
  phone: string;
  outcome: string | null;
  error: string | null;
  messageId: string | null;
}

export interface WhatsappBroadcast {
  id: string;
  name: string;
  status: string;
  templateId?: string;
  phoneNumberId?: string;
  contactFilter?: BroadcastAudience;
  templateVariables?: Record<string, string>;
  templateComponents?: unknown[];
  total: number;
  sent: number;
  failed: number;
  scheduledAt?: string;
  createdAt: string;
  lastError?: string | null;
}

export const whatsappBroadcastService = {
  list: () => api.get<{ data: WhatsappBroadcast[] }>('/whatsapp/broadcasts'),
  get: (id: string) => api.get<{ data: WhatsappBroadcast }>(`/whatsapp/broadcasts/${id}`),
  create: (payload: {
    name: string;
    templateId: string;
    phoneNumberId?: string;
    templateComponents?: unknown[];
    contactFilter?: BroadcastAudience;
    templateVariables?: Record<string, string>;
    scheduledAt?: string;
  }) => api.post<{ data: WhatsappBroadcast }>('/whatsapp/broadcasts', payload),
  preview: (id: string) =>
    api.get<{ data: BroadcastPreview }>(`/whatsapp/broadcasts/${id}/preview`),
  pause: (id: string) => api.post(`/whatsapp/broadcasts/${id}/pause`),
  resume: (id: string) => api.post(`/whatsapp/broadcasts/${id}/resume`),
  cancel: (id: string) => api.post(`/whatsapp/broadcasts/${id}/cancel`),
  recipients: (id: string, after?: string) =>
    api.get<{ data: { items: BroadcastRecipient[]; nextCursor: string | null } }>(
      `/whatsapp/broadcasts/${id}/recipients`,
      { params: { after } },
    ),
  duplicate: (id: string) =>
    api.post<{ data: WhatsappBroadcast }>(`/whatsapp/broadcasts/${id}/duplicate`),
  send: (id: string) => api.post(`/whatsapp/broadcasts/${id}/send`),
  schedule: (id: string, scheduledAt: string) =>
    api.patch(`/whatsapp/broadcasts/${id}/schedule`, { scheduledAt }),
  remove: (id: string) => api.delete(`/whatsapp/broadcasts/${id}`),
};
