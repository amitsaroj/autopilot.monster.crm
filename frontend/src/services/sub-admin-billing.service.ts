import api from '../lib/api/client';

export const subAdminBillingService = {
  getSubscription: async () => {
    const response = await api.get('/sub-admin/billing/subscription');
    return response.data;
  },
  getInvoices: async () => {
    const response = await api.get('/sub-admin/billing/invoices');
    return response.data;
  },
};
