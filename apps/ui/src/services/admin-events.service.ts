import api from '../lib/api/client';

export const adminEventsService = {
  getDefinitions: async () => {
    const response = await api.get('/admin/events/definitions');
    return response.data;
  },
};
