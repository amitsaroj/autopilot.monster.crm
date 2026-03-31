import api from '../lib/api/client';

export enum BillingType {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  currency: string;
  billingType: BillingType;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export const productService = {
  getProducts: () => api.get('/crm/products'),
  getProduct: (id: string) => api.get(`/crm/products/${id}`),
  createProduct: (data: Partial<Product>) => api.post('/crm/products', data),
  updateProduct: (id: string, data: Partial<Product>) => api.put(`/crm/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/crm/products/${id}`),
};
