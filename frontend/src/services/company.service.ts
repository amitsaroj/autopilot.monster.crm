import api from '../lib/api/client';

export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  sizeRange?: string;
  annualRevenueRange?: string;
  tags?: string[];
  createdAt: string;
}

export interface CompanyContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CompanyDeal {
  id: string;
  name: string;
  value: number;
  currency: string;
  status: string;
}

export interface CompanyActivity {
  id: string;
  type: string;
  subject: string;
  occurredAt: string;
}

export const companyService = {
  getCompanies: () => api.get('/crm/companies'),

  getCompany: (id: string) => api.get(`/crm/companies/${id}`),

  createCompany: (data: Partial<Company>) => api.post('/crm/companies', data),

  updateCompany: (id: string, data: Partial<Company>) => api.put(`/crm/companies/${id}`, data),

  deleteCompany: (id: string) => api.delete(`/crm/companies/${id}`),

  getContacts: (id: string) => api.get<{ data: CompanyContact[] }>(`/crm/companies/${id}/contacts`),

  getDeals: (id: string) => api.get<{ data: CompanyDeal[] }>(`/crm/companies/${id}/deals`),

  getActivities: (id: string) =>
    api.get<{ data: CompanyActivity[] }>(`/crm/companies/${id}/activities`),
};
