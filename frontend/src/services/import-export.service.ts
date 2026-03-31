import api from '../lib/api/client';

export const importExportService = {
  importData: (entityType: 'lead' | 'contact', data: any[]) => 
    api.post('/crm/import', { entityType, data }),
  
  exportData: (entityType: 'lead' | 'contact') => 
    api.get(`/crm/export/${entityType}`),
};
