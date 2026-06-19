import api from '../lib/api/client';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  companyId?: string;
  status: 'LEAD' | 'PROSPECT' | 'CUSTOMER' | 'CHURNED';
  tags: string[];
  customFields: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const contactService = {
  getContacts: () => api.get('/crm/contacts'),
  getContact: (id: string) => api.get(`/crm/contacts/${id}`),
  createContact: (data: Partial<Contact>) => api.post('/crm/contacts', data),
  updateContact: (id: string, data: Partial<Contact>) => api.put(`/crm/contacts/${id}`, data),
  deleteContact: (id: string) => api.delete(`/crm/contacts/${id}`),
  getActivities: (id: string) => api.get(`/crm/contacts/${id}/activities`),
  getDeals: (id: string) => api.get(`/crm/contacts/${id}/deals`),
  getNotes: (id: string) => api.get(`/crm/contacts/${id}/notes`),
  createNote: (id: string, data: { title: string; content: string }) =>
    api.post(`/crm/contacts/${id}/notes`, data),
  getCalls: (id: string) => api.get(`/crm/contacts/${id}/calls`),
  getEmails: (id: string) => api.get(`/crm/contacts/${id}/emails`),
  getWhatsapp: (id: string) => api.get(`/crm/contacts/${id}/whatsapp`),
  exportContacts: () => api.get('/crm/export/contact'),
  mergeContacts: (primaryId: string, secondaryId: string) =>
    api.post('/crm/contacts/merge', { primaryId, secondaryId }),
};
