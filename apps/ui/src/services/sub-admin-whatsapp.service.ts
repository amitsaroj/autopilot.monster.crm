import api from '../lib/api/client';

export const subAdminWhatsappService = {
  getProfiles: async () => {
    const response = await api.get('/sub-admin/whatsapp/profiles');
    return response.data;
  },
  linkProfile: async (data: any) => {
    const response = await api.post('/sub-admin/whatsapp/profiles', data);
    return response.data;
  },
};
