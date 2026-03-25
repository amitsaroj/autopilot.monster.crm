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
};
