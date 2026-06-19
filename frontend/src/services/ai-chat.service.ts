import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationSummary {
  id: string;
  title?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  meta?: { title?: string };
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(^| )access_token=([^;]+)/);
    const token = match ? match[2] : null;
    const tenantId = localStorage.getItem('tenant_id');
    if (token) headers.Authorization = `Bearer ${token}`;
    if (tenantId) headers['x-tenant-id'] = tenantId;
  }
  return headers;
}

export const aiChatService = {
  sendMessage: (message: string, conversationId?: string, useRag = false) =>
    api.post<{ data: { reply: string; conversationId: string } }>('/ai/chat', {
      message,
      conversationId,
      useRag,
      memoryWindow: 6,
    }),

  streamMessage: async (
    message: string,
    onChunk: (chunk: string, conversationId?: string) => void,
    conversationId?: string,
    useRag = false,
  ): Promise<string> => {
    const baseURL = api.defaults.baseURL ?? 'http://localhost:8000/api/v1';
    const response = await fetch(`${baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, conversationId, useRag, memoryWindow: 6 }),
    });

    if (!response.ok || !response.body) {
      throw new Error('Stream request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalConversationId = conversationId ?? '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = JSON.parse(line.slice(6)) as {
          chunk?: string;
          done?: boolean;
          conversationId?: string;
        };
        if (payload.conversationId) {
          finalConversationId = payload.conversationId;
        }
        if (payload.chunk) {
          onChunk(payload.chunk, finalConversationId);
        }
      }
    }

    return finalConversationId;
  },

  getConversations: async () => {
    const res = await api.get('/ai/conversations');
    const data = parseApiData<{ items: ConversationSummary[]; total: number }>(res);
    const items = data?.items ?? (Array.isArray(data) ? data : []);
    return {
      data: items.map((item) => ({
        ...item,
        title: item.title ?? item.meta?.title,
      })),
    };
  },

  getMessages: async (id: string) => {
    const res = await api.get(`/ai/conversations/${id}`);
    const data = parseApiData<{ messages: Array<{ role: string; content: string }> }>(res);
    return { data: data?.messages ?? [] };
  },
};
