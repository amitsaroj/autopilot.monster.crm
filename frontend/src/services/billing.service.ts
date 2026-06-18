import api from '../lib/api/client';

export interface PaymentMethod {
  id: string;
  brand: string;
  lastFour: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  type: string;
}

export const billingService = {
  getInvoices: () => api.get('/billing/invoices'),
  listPaymentMethods: () => api.get<{ data: PaymentMethod[] }>('/billing/payment-methods'),
  createSetupIntent: () => api.post<{ data: { clientSecret: string } }>('/billing/payment-methods'),
  attachPaymentMethod: (paymentMethodId: string, setDefault = false) =>
    api.post('/billing/payment-methods/attach', { paymentMethodId, setDefault }),
  removePaymentMethod: (id: string) => api.delete(`/billing/payment-methods/${id}`),
  setDefaultPaymentMethod: (id: string) => api.patch(`/billing/payment-methods/${id}/default`),
};
