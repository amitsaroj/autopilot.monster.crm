import api from '../lib/api/client';
import { parseApiData } from '../lib/api/parse-response';

export interface StorageFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  fileKey: string;
  createdAt: string;
}

export const storageFileService = {
  list: async () => {
    const response = await api.get<{ data: unknown }>('/storage/files');
    return {
      ...response,
      data: { ...response.data, data: parseApiData<StorageFile[]>(response) ?? [] },
    };
  },
  get: (id: string) => api.get<{ data: StorageFile }>(`/storage/files/${id}`),
  getDownloadUrl: (id: string) =>
    api.get<{ data: { downloadUrl: string } }>(`/storage/files/${id}/download`),
  remove: (id: string) => api.delete(`/storage/files/${id}`),
};
