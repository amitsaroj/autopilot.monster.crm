import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface OmnichannelConversation {
  id: string;
  contactId?: string;
  channel: string;
  status: string;
  lastMessageAt?: string;
  meta?: Record<string, unknown>;
  contact?: { firstName?: string; lastName?: string; email?: string; name?: string };
}

export interface OmnichannelMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  type?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export const omnichannelService = {
  getConversations: async () => {
    const res = await api.get('/omnichannel/conversations');
    return parseApiData<OmnichannelConversation[]>(res) ?? (Array.isArray(res.data) ? res.data : []);
  },
  getMessages: async (id: string) => {
    const res = await api.get(`/omnichannel/conversations/${id}/messages`);
    return parseApiData<OmnichannelMessage[]>(res) ?? (Array.isArray(res.data) ? res.data : []);
  },
  send: (payload: {
    contactId: string;
    text: string;
    preferredChannel: 'VOICE' | 'WHATSAPP' | 'EMAIL' | 'WEBCHAT';
  }) => api.post('/omnichannel/send', payload),
  route: (id: string) => api.post(`/omnichannel/conversations/${id}/route`),
};
