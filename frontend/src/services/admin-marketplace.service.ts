import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface AdminPlugin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version?: string;
  author?: string;
  category?: string;
  status: string;
  isPremium: boolean;
  installCount?: number;
  priceMonthly?: number;
  vendorId?: string;
  createdAt: string;
}

export const adminMarketplaceService = {
  getPlugins: async () => {
    const response = await api.get('/admin/marketplace/plugins');
    return { data: { data: parseApiData<AdminPlugin[]>(response) ?? [] } };
  },

  createPlugin: async (data: Partial<AdminPlugin>) => {
    const response = await api.post('/admin/marketplace/plugins', data);
    return response.data;
  },

  updatePlugin: async (id: string, data: Partial<AdminPlugin>) => {
    const response = await api.put(`/admin/marketplace/plugins/${id}`, data);
    return response.data;
  },

  deletePlugin: async (id: string) => {
    const response = await api.delete(`/admin/marketplace/plugins/${id}`);
    return response.data;
  },

  getInstallations: async (id: string) => {
    const response = await api.get(`/admin/marketplace/plugins/${id}/installations`);
    return response.data;
  },

  getMonetization: async () => {
    const response = await api.get('/admin/marketplace/monetization');
    return response.data;
  },
};
