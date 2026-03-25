import api from '../lib/api/client';

export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string;
  direction: 'INBOUND' | 'OUTBOUND';
  isRead: boolean;
  leadId?: string;
  contactId?: string;
  createdAt: string;
}

export const emailService = {
  getEmails: () => api.get('/crm/emails'),
  getEmail: (id: string) => api.get(`/crm/emails/${id}`),
  sendEmail: (data: Partial<EmailMessage>) => api.post('/crm/emails/send', data),
  deleteEmail: (id: string) => api.delete(`/crm/emails/${id}`),
};
