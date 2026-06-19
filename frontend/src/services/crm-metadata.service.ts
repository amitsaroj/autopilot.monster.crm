import api from '../lib/api/client';

export interface CrmTag {
  id: string;
  name: string;
  color?: string;
}

export interface CrmSegment {
  id: string;
  name: string;
  description?: string;
  filters?: Record<string, unknown>;
}

export interface CustomField {
  id: string;
  name: string;
  fieldType: string;
  entityType: string;
  isRequired: boolean;
  options?: string[];
}

export const crmMetadataService = {
  getTags: () => api.get<{ data: CrmTag[] }>('/crm/tags'),
  createTag: (data: { name: string; color?: string }) => api.post('/crm/tags', data),
  deleteTag: (id: string) => api.delete(`/crm/tags/${id}`),
  getSegments: () => api.get<{ data: CrmSegment[] }>('/crm/segments'),
  createSegment: (data: Partial<CrmSegment>) => api.post('/crm/segments', data),
  deleteSegment: (id: string) => api.delete(`/crm/segments/${id}`),
  getCustomFields: () => api.get<{ data: CustomField[] }>('/crm/custom-fields'),
  getCustomField: (id: string) => api.get<{ data: CustomField }>(`/crm/custom-fields/${id}`),
  createCustomField: (data: Partial<CustomField>) => api.post('/crm/custom-fields', data),
  updateCustomField: (id: string, data: Partial<CustomField>) =>
    api.put(`/crm/custom-fields/${id}`, data),
  deleteCustomField: (id: string) => api.delete(`/crm/custom-fields/${id}`),
};
