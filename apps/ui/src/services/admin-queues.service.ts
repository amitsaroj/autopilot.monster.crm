import api from '../lib/api/client';

export const adminQueuesService = {
  getStatus: async () => {
    const response = await api.get('/admin/queues');
    return response.data;
  },

  cleanQueue: async (queueName: string) => {
    const response = await api.post(`/admin/queues/${queueName}/clean`, {});
    return response.data;
  },
};
