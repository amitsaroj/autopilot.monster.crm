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
  phoneNumberId?: string;
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
  lastInboundAt?: string | null;
  windowExpiresAt?: string | null;
  canReply?: boolean;
  replyBlockedReason?: string | null;
  phoneNumberId?: string | null;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  awaitingReplyCount?: number;
}

export type WhatsAppConversation = WhatsAppConversationSummary;

export const whatsappConversationService = {
  list: () => api.get<{ data: WhatsAppConversationSummary[] }>('/whatsapp/conversations'),
  get: (phone: string) =>
    api.get<{ data: WhatsAppMessage[] }>(`/whatsapp/conversations/${encodeURIComponent(phone)}`),
  getMessages: (phone: string) =>
    api.get<{ data: WhatsAppMessage[] }>(`/whatsapp/conversations/${encodeURIComponent(phone)}`),
  send: (
    phone: string,
    message: string,
    wabaId?: string,
    idempotencyKey?: string,
    expectedLastOutboundId?: string | null,
  ) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/messages`, {
      message,
      wabaId,
      idempotencyKey,
      expectedLastOutboundId,
    }),
  sendTemplate: (
    phone: string,
    templateName: string,
    language: string,
    components: unknown[],
    wabaId?: string,
    idempotencyKey?: string,
    expectedLastOutboundId?: string | null,
  ) =>
    api.post('/whatsapp/send-template', {
      to: phone,
      templateName,
      language,
      components,
      wabaId,
      idempotencyKey,
      expectedLastOutboundId,
    }),
  sendContent: (
    phone: string,
    content: Record<string, unknown>,
    wabaId: string,
    idempotencyKey: string,
    expectedLastOutboundId?: string | null,
  ) =>
    api.post('/whatsapp/send-content', {
      to: phone,
      content,
      wabaId,
      idempotencyKey,
      expectedLastOutboundId,
    }),
  update: (
    phone: string,
    data: {
      status?: 'OPEN' | 'RESOLVED';
      priority?: WhatsAppConversationSummary['priority'];
      tags?: string[];
    },
  ) => api.patch(`/whatsapp/conversations/${encodeURIComponent(phone)}`, data),
  markRead: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/read`),
  notes: (phone: string) => api.get(`/whatsapp/conversations/${encodeURIComponent(phone)}/notes`),
  addNote: (phone: string, content: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/notes`, { content }),
  assign: (phone: string, assigneeId: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/assign`, { assigneeId }),
  resolve: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/resolve`),
};
