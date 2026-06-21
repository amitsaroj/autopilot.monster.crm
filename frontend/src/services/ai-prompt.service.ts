import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface AiPrompt {
  id: string;
  name: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export const aiPromptService = {
  list: async () => {
    const res = await api.get('/ai/prompts');
    return { data: { data: parseApiData<AiPrompt[]>(res) ?? [] } };
  },
  create: (payload: { name: string; content: string; category?: string }) =>
    api.post('/ai/prompts', payload),
  remove: (id: string) => api.delete(`/ai/prompts/${id}`),
};
