import api from '../lib/api/client';

export interface InstalledPlugin {
  id: string;
  pluginId: string;
  isEnabled: boolean;
  installedAt?: string;
  plugin?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    version?: string;
    author?: string;
    category?: string;
    isPremium: boolean;
  };
}

export const pluginsService = {
  listInstalled: () => api.get<{ data: InstalledPlugin[] }>('/plugins'),
  enable: (id: string) => api.post<{ data: InstalledPlugin }>(`/plugins/enable/${id}`),
  disable: (id: string) => api.delete(`/plugins/${id}`),
};
