import api from '../lib/api/client';

export type EntityType = 'lead' | 'contact';

export const bulkService = {
  updateStatus: (entityType: EntityType, ids: string[], status: string) => 
    api.patch('/crm/bulk/status', { entityType, ids, status }),
  
  delete: (entityType: EntityType, ids: string[]) => 
    api.post('/crm/bulk/delete', { entityType, ids }),
};
