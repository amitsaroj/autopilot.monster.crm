import api from '../lib/api/client';

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  url?: string;
  score?: number;
}

const TYPE_HREF: Record<string, (id: string) => string> = {
  contact: (id) => `/crm/contacts/${id}`,
  deal: (id) => `/crm/deals/${id}`,
  company: (id) => `/crm/companies/${id}`,
  lead: (id) => `/crm/leads/${id}`,
};

function normalizeResults(payload: unknown): SearchResult[] {
  if (!payload || typeof payload !== 'object') return [];

  const body = payload as {
    data?: unknown;
    results?: Array<{ id: string; type: string; title: string; subtitle?: string; url?: string }>;
  };

  const rawList = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body.results)
      ? body.results
      : Array.isArray(payload)
        ? payload
        : [];

  return rawList.map((item) => {
    const type = String(item.type || 'contact');
    const hrefFn = TYPE_HREF[type.toLowerCase()];
    return {
      id: item.id,
      type,
      title: item.title,
      subtitle: item.subtitle,
      url: item.url ?? (hrefFn ? hrefFn(item.id) : undefined),
    };
  });
}

export const searchService = {
  search: async (query: string, types = 'all') => {
    const res = await api.get('/search', { params: { q: query, types } });
    return { data: { data: normalizeResults(res.data) } };
  },
};
