import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  contactId?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category?: string;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export const supportService = {
  getTickets: async () => {
    const res = await api.get('/support/tickets');
    return { data: { data: parseApiData<SupportTicket[]>(res) ?? [] } };
  },
  getTicket: (id: string) => api.get(`/support/tickets/${id}`),
  createTicket: (payload: Partial<SupportTicket>) => api.post('/support/tickets', payload),
  updateTicket: (id: string, payload: Partial<SupportTicket>) =>
    api.put(`/support/tickets/${id}`, payload),
  deleteTicket: (id: string) => api.delete(`/support/tickets/${id}`),
  getStats: () => api.get('/support/stats'),
  getArticles: async () => {
    const res = await api.get('/support/articles');
    return { data: { data: parseApiData<KnowledgeArticle[]>(res) ?? [] } };
  },
  getArticle: (id: string) => api.get(`/support/articles/${id}`),
  createArticle: (payload: Partial<KnowledgeArticle>) => api.post('/support/articles', payload),
  updateArticle: (id: string, payload: Partial<KnowledgeArticle>) =>
    api.put(`/support/articles/${id}`, payload),
  deleteArticle: (id: string) => api.delete(`/support/articles/${id}`),
};
