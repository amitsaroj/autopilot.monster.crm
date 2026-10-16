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
  teamId?: string;
  status: 'OPEN' | 'RESOLVED';
  lastInboundAt?: string | null;
  windowExpiresAt?: string | null;
  canReply?: boolean;
  replyBlockedReason?: string | null;
  phoneNumberId?: string | null;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  tags?: string[];
  awaitingReplyCount?: number;
  csatStatus?: 'SENDING' | 'REQUESTED' | 'RECEIVED' | 'CANCELLED' | 'EXPIRED';
  csatRating?: number;
}

export type WhatsAppConversation = WhatsAppConversationSummary;

export const whatsappConversationService = {
  list: (page = 1, limit = 50, phone?: string, phoneNumberId?: string) =>
    api.get<{ data: WhatsAppConversationSummary[] }>('/whatsapp/conversations', {
      params: { page, limit, phone, phoneNumberId },
    }),
  listAll: async (limit = 100) => {
    const conversations: WhatsAppConversationSummary[] = [];
    for (let page = 1; ; page += 1) {
      const response = await api.get<{ data: WhatsAppConversationSummary[] }>(
        '/whatsapp/conversations',
        { params: { page, limit } },
      );
      const rows = response.data?.data ?? [];
      conversations.push(...rows);
      if (rows.length < limit) return conversations;
    }
  },
  get: (phone: string, phoneNumberId?: string, page = 1, limit = 50) =>
    api.get<{ data: WhatsAppMessage[] }>(`/whatsapp/conversations/${encodeURIComponent(phone)}`, {
      params: { phoneNumberId, page, limit },
    }),
  getMessages: (phone: string, phoneNumberId?: string, page = 1, limit = 50) =>
    api.get<{ data: WhatsAppMessage[] }>(`/whatsapp/conversations/${encodeURIComponent(phone)}`, {
      params: { phoneNumberId, page, limit },
    }),
  getAllMessages: async (phone: string, phoneNumberId?: string, limit = 100) => {
    const pages: WhatsAppMessage[][] = [];
    for (let page = 1; ; page += 1) {
      const response = await api.get<{ data: WhatsAppMessage[] }>(
        `/whatsapp/conversations/${encodeURIComponent(phone)}`,
        { params: { phoneNumberId, page, limit } },
      );
      const rows = response.data?.data ?? [];
      pages.push(rows);
      if (rows.length < limit) return pages.reverse().flat();
    }
  },
  downloadMedia: (messageId: string, index: number) =>
    api.get<Blob>(`/whatsapp/messages/${encodeURIComponent(messageId)}/media/${index}`, {
      responseType: 'blob',
    }),
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
  assignRoundRobin: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/assign/round-robin`),
  assignOnline: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/assign/online`),
  assignTeam: (phone: string, teamId: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/assign/team`, { teamId }),
  heartbeatPresence: () => api.post('/whatsapp/inbox/presence/heartbeat'),
  onlinePresence: () => api.get<{ onlineUserIds: string[] }>('/whatsapp/inbox/presence'),
  resolve: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/resolve`),
  requestCsat: (phone: string) =>
    api.post(`/whatsapp/conversations/${encodeURIComponent(phone)}/csat`),
};
