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

export const companyService = {
  getCompanies: () => api.get('/crm/companies'),
  
  getCompany: (id: string) => api.get(`/crm/companies/${id}`),
  
  createCompany: (data: Partial<Company>) => api.post('/crm/companies', data),
  
  updateCompany: (id: string, data: Partial<Company>) => api.put(`/crm/companies/${id}`, data),
  
  deleteCompany: (id: string) => api.delete(`/crm/companies/${id}`),
};
