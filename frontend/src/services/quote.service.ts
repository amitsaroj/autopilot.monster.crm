import api from '../lib/api/client';

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export interface QuoteLineItem {
  productId: string;
  description: string;
  qty: number;
  price: number;
  discount: number;
}

export interface Quote {
  id: string;
  number: string;
  dealId?: string;
  contactId?: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  validUntil?: string;
  notes?: string;
  createdAt: string;
}

export const quoteService = {
  getQuotes: () => api.get('/crm/quotes'),
  getQuote: (id: string) => api.get(`/crm/quotes/${id}`),
  createQuote: (data: Partial<Quote>) => api.post('/crm/quotes', data),
  updateQuote: (id: string, data: Partial<Quote>) => api.put(`/crm/quotes/${id}`, data),
  deleteQuote: (id: string) => api.delete(`/crm/quotes/${id}`),
  sendQuote: (id: string, data: { to: string; message?: string }) =>
    api.post(`/crm/quotes/${id}/send`, data),
  acceptQuote: (id: string) => api.post(`/crm/quotes/${id}/accept`),
  declineQuote: (id: string) => api.post(`/crm/quotes/${id}/decline`),
  downloadPdf: (id: string) => api.get(`/crm/quotes/${id}/pdf`, { responseType: 'blob' }),
};
