import api from '../lib/api/client';

export const subAdminWorkflowsService = {
  getWorkflows: async () => {
    const response = await api.get('/sub-admin/workflows');
    return response.data;
  },
  createWorkflow: async (data: any) => {
    const response = await api.post('/sub-admin/workflows', data);
    return response.data;
  },
  deleteWorkflow: async (id: string) => {
    const response = await api.delete(`/sub-admin/workflows/${id}`);
    return response.data;
  },
};
