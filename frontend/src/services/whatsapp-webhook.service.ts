import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';

export interface WhatsAppWebhookEvent {
  id: string;
  phoneNumberId: string | null;
  field: string;
  status: 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'IGNORED';
  attempts: number;
  lastError: string | null;
  receivedAt: string;
  processedAt: string | null;
}

export const whatsappWebhookService = {
  list: async () =>
    parseApiData<WhatsAppWebhookEvent[]>(await api.get('/whatsapp/webhook-events')) ?? [],
  replay: async (id: string) =>
    parseApiData<{ enqueued: boolean }>(
      await api.post(`/whatsapp/webhook-events/${encodeURIComponent(id)}/replay`),
    ),
};
