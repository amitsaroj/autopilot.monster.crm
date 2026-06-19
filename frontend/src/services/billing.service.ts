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

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  stripeCustomerId?: string;
}

export interface Invoice {
  id: string;
  number: string;
  total: number;
  currency: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  pdfUrl?: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
}

export const billingService = {
  getPlans: () => api.get<Plan[]>('/monetization/plans'),
  getSubscription: () => api.get<Subscription>('/monetization/subscription'),
  getUsage: () => api.get<Record<string, number>>('/monetization/usage'),
  createCheckout: (planId: string, billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') =>
    api.post<{ url: string }>('/monetization/upgrade', { planId, billingCycle }),
  getPortal: () => api.post<{ url: string }>('/monetization/portal'),
  downgrade: (planId: string) => api.post('/billing/subscription/downgrade', { planId }),
  cancel: (atPeriodEnd = true) => api.post('/billing/subscription/cancel', { atPeriodEnd }),
  reactivate: () => api.post('/billing/subscription/reactivate'),
  getInvoices: () => api.get<Invoice[]>('/billing/invoices'),
  getInvoice: (id: string) => api.get<{ data: Invoice }>(`/billing/invoices/${id}`),
  listPaymentMethods: () => api.get<{ data: PaymentMethod[] }>('/billing/payment-methods'),
  createSetupIntent: () => api.post<{ data: { clientSecret: string } }>('/billing/payment-methods'),
  attachPaymentMethod: (paymentMethodId: string, setDefault = false) =>
    api.post('/billing/payment-methods/attach', { paymentMethodId, setDefault }),
  removePaymentMethod: (id: string) => api.delete(`/billing/payment-methods/${id}`),
  setDefaultPaymentMethod: (id: string) => api.patch(`/billing/payment-methods/${id}/default`),
};
