import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface AdminInvoice {
  id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  tenantId?: string;
}

export const adminInvoicesService = {
  findAll: async (params?: { tenantId?: string; status?: string }) => {
    const response = await api.get('/monetization/admin/invoices', { params });
    return { data: { data: parseApiData<AdminInvoice[]>(response) ?? [] } };
  },

  findOne: async (id: string) => {
    const response = await api.get(`/monetization/admin/invoices/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/invoices/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete(`/admin/invoices/${id}`);
    return response.data;
  },
};
