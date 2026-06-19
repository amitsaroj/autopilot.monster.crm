import api from '../lib/api/client';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  mediaUrls?: string[];
  createdAt: string;
}

export interface WhatsAppConversationSummary {
  phone: string;
  contactName?: string;
  lastMessage: string;
  lastMessageAt: string;
  direction: 'INBOUND' | 'OUTBOUND';
  messageCount: number;
  unreadCount: number;
  assigneeId?: string;
  status: 'OPEN' | 'RESOLVED';
}

export type WhatsAppConversation = WhatsAppConversationSummary;

export const whatsappConversationService = {
  list: () => api.get<{ data: WhatsAppConversationSummary[] }>('/whatsapp/conversations'),
  get: (phone: string) =>
    api.get<{ data: { messages: WhatsAppMessage[] } }>(
      `/whatsapp/conversations/${encodeURIComponent(phone)}`,
    ),
  getMessages: (phone: string) =>
    api.get<{ data: WhatsAppMessage[] }>(`/whatsapp/conversations/${encodeURIComponent(phone)}`),
  send: (phone: string, message: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/messages`, { message }),
  assign: (phone: string, assigneeId: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/assign`, { assigneeId }),
  resolve: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/resolve`),
};
