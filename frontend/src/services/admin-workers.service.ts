import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface WorkerStatus {
  queueName: string;
  activeWorkers: number;
  status: 'ACTIVE' | 'IDLE';
}

export const adminWorkersService = {
  getStatus: async () => {
    const response = await api.get('/admin/workers/status');
    return { data: { data: parseApiData<WorkerStatus[]>(response) ?? [] } };
  },
};
