import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface GlobalPlatformStats {
  tenants: number;
  users: number;
  activeSubscriptions: number;
  totalRevenue: number;
  usage: Record<string, number> | number;
}

export const adminMetricsService = {
  getStats: async () => {
    const response = await api.get('/admin/metrics/stats');
    return parseApiData<GlobalPlatformStats>(response);
  },
  getGlobal: async () => {
    const response = await api.get('/admin/metrics/global');
    return parseApiData<GlobalPlatformStats>(response);
  },
  getHealth: async () => {
    const response = await api.get('/admin/metrics/health');
    return parseApiData<{
      status: string;
      uptime: number;
      memory: { heapUsed: number; heapTotal: number; rss: number };
      timestamp: string;
    }>(response);
  },
};
