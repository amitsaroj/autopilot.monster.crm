import api from '../lib/api/client';

export const subAdminVoiceService = {
  getNumbers: async () => {
    const response = await api.get('/sub-admin/voice/numbers');
    return response.data;
  },
  provisionNumber: async (data: any) => {
    const response = await api.post('/sub-admin/voice/numbers', data);
    return response.data;
  },
};
