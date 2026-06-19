import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    usage: { heapUsed: number; heapTotal: number; rss: number };
  };
  cpu: { load: number[]; count: number };
  platform: string;
  nodeVersion: string;
}

export const adminHealthService = {
  getHealth: async () => {
    const response = await api.get('/admin/health');
    return { data: { data: parseApiData<SystemHealth>(response) } };
  },
};
