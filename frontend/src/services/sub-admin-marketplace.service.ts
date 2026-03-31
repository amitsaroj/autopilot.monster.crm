import api from '../lib/api/client';

export const subAdminMarketplaceService = {
  discover: async () => {
    const response = await api.get('/sub-admin/marketplace/discover');
    return response.data;
  },
  installItem: async (id: string) => {
    const response = await api.post(`/sub-admin/marketplace/install/${id}`);
    return response.data;
  },
};
