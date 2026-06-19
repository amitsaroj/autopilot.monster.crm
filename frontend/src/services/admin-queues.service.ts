import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface QueueStatus {
  name: string;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
}

export const adminQueuesService = {
  getStatus: async () => {
    const response = await api.get('/admin/queues');
    return { data: { data: parseApiData<QueueStatus[]>(response) ?? [] } };
  },

  cleanQueue: async (queueName: string) => {
    const response = await api.post(`/admin/queues/${queueName}/clean`, {});
    return response.data;
  },
};
