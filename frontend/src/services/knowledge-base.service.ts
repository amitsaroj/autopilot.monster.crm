import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  sourceType: string;
  status: string;
  indexMeta?: {
    documents?: Array<{
      id: string;
      fileName: string;
      chunksIndexed?: number;
      embeddingTokens?: number;
      indexedAt?: string;
    }>;
    totalChunks?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const knowledgeBaseService = {
  list: async () => {
    const res = await api.get('/ai/knowledge-bases');
    return { data: parseApiData<KnowledgeBase[]>(res) ?? [] };
  },
  get: async (id: string) => {
    const res = await api.get(`/ai/knowledge-bases/${id}`);
    return parseApiData<KnowledgeBase>(res);
  },
  create: (payload: { name: string; description?: string; sourceType?: string }) =>
    api.post('/ai/knowledge-bases', { sourceType: 'FILE', ...payload }),
  remove: (id: string) => api.delete(`/ai/knowledge-bases/${id}`),
  sync: (id: string) => api.post(`/ai/knowledge-bases/${id}/sync`),
  uploadDocument: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/ai/knowledge-bases/${id}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadLegacy: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/ai/knowledge-base/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
