import api from '../lib/api/client';
import { API_BASE } from '../lib/constants';
import { getToken } from '../lib/auth';

type WritableFile = {
  write: (chunk: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
  abort: () => Promise<void>;
};

type SaveFileWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName: string;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<{ createWritable: () => Promise<WritableFile> }>;
};

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
  audiencePrepared: boolean;
  scheduledAt?: string;
  recurrenceFrequency?: 'DAILY' | 'WEEKLY' | null;
  recurrenceOccurrence?: number;
  recurrenceSeriesId?: string | null;
  recurrenceState?: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | null;
  approvalRequired: boolean;
  approvalStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalRequestedBy?: string | null;
  approvalReviewedBy?: string | null;
  approvalReviewedAt?: string | null;
  approvalNote?: string | null;
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
  exportRecipients: (id: string) =>
    api.get<Blob>(`/whatsapp/broadcasts/${id}/recipients/export`, { responseType: 'blob' }),
  streamRecipientsToFile: async (id: string, filename: string): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.isSecureContext) return false;
    const saveFile = (window as SaveFileWindow).showSaveFilePicker;
    if (!saveFile) return false;
    const token = getToken();
    const tenantId = localStorage.getItem('tenant_id');
    const handle = await saveFile.call(window, {
      suggestedName: filename,
      types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
    });
    const response = await fetch(`${API_BASE}/whatsapp/broadcasts/${id}/recipients/export`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      },
    });
    let reader: ReadableStreamDefaultReader<Uint8Array>;
    if (response.status === 401) {
      // Reuse Axios' refresh-token interceptor, then stream its Blob into the chosen file.
      const refreshed = await api.get<Blob>(`/whatsapp/broadcasts/${id}/recipients/export`, {
        responseType: 'blob',
      });
      reader = refreshed.data.stream().getReader();
    } else if (response.ok && response.body) {
      reader = response.body.getReader();
    } else {
      await response.body?.cancel();
      throw new Error('Could not stream the recipient export.');
    }
    const writer = await handle.createWritable();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) await writer.write(value);
      }
      await writer.close();
    } catch (error: unknown) {
      await writer.abort().catch(() => undefined);
      throw error;
    } finally {
      reader.releaseLock();
    }
    return true;
  },
  duplicate: (id: string) =>
    api.post<{ data: WhatsappBroadcast }>(`/whatsapp/broadcasts/${id}/duplicate`),
  requestApproval: (id: string) => api.post(`/whatsapp/broadcasts/${id}/approval/request`),
  reviewApproval: (id: string, decision: 'APPROVED' | 'REJECTED', note?: string) =>
    api.post(`/whatsapp/broadcasts/${id}/approval/review`, { decision, note }),
  send: (id: string) => api.post(`/whatsapp/broadcasts/${id}/send`),
  schedule: (
    id: string,
    scheduledAt: string,
    options: {
      recipientLocalTime?: string;
      recurrenceFrequency?: 'DAILY' | 'WEEKLY';
      recurrenceEndAt?: string;
      recurrenceMaxOccurrences?: number;
    } = {},
  ) => api.patch(`/whatsapp/broadcasts/${id}/schedule`, { scheduledAt, ...options }),
  remove: (id: string) => api.delete(`/whatsapp/broadcasts/${id}`),
};
