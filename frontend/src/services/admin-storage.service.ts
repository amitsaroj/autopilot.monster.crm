import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface StorageBucket {
  name: string;
  size: string;
  fileCount: number;
}

export interface StorageStats {
  totalSize: string;
  buckets: StorageBucket[];
  provider: string;
}

export const adminStorageService = {
  getStats: async () => {
    const response = await api.get('/admin/storage/stats');
    return { data: { data: parseApiData<StorageStats>(response) } };
  },
};
