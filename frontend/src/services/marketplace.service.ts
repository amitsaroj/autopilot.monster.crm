import api from '../lib/api/client';

export interface MarketplacePlugin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  version?: string;
  author?: string;
  icon?: string;
  isPremium: boolean;
  status: string;
  category?: string;
}

export interface TenantPluginInstallation {
  id: string;
  pluginId: string;
  isEnabled: boolean;
  plugin?: MarketplacePlugin;
  installedAt?: string;
}

export const marketplaceService = {
  listApps: () => api.get<{ data: MarketplacePlugin[] }>('/marketplace'),
  getApp: (id: string) => api.get<{ data: MarketplacePlugin }>(`/marketplace/${id}`),
  listInstalled: () => api.get<{ data: TenantPluginInstallation[] }>('/marketplace/installed'),
  install: (id: string) => api.post<{ data: TenantPluginInstallation }>(`/marketplace/${id}/install`),
  uninstall: (id: string) => api.delete(`/marketplace/${id}/uninstall`),
};
