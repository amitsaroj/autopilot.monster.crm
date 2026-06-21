import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface BillingStats {
  totalRevenue: number;
  pendingRevenue: number;
}

export const adminBillingService = {
  getSettings: async () => {
    const response = await api.get('/admin/billing/settings');
    return response.data;
  },

  updateSettings: async (settings: Record<string, unknown>) => {
    const response = await api.post('/admin/billing/settings', settings);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/billing/stats');
    return { data: { data: parseApiData<BillingStats>(response) } };
  },
};
