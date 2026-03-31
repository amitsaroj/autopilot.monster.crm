import api from '../lib/api/client';

export const adminSchedulerService = {
  getJobs: async () => {
    const response = await api.get('/admin/scheduler/jobs');
    return response.data;
  },
};
