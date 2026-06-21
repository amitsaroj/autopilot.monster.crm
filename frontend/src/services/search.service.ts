import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  url?: string;
  score?: number;
}

export const searchService = {
  search: async (query: string, types = 'all') => {
    const res = await api.get('/search', { params: { q: query, types } });
    return { data: { data: parseApiData<SearchResult[]>(res) ?? [] } };
  },
};
