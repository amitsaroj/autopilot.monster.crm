import api from '../lib/api/client';

export interface Note {
  id: string;
  title: string;
  content: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  authorId?: string;
  tags: string[];
  createdAt: string;
}

export const noteService = {
  getNotes: (params?: { contactId?: string; dealId?: string; companyId?: string }) => 
    api.get('/crm/notes', { params }),
  createNote: (data: Partial<Note>) => api.post('/crm/notes', data),
  deleteNote: (id: string) => api.delete(`/crm/notes/${id}`),
};
