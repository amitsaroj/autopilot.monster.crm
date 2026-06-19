import api from '../lib/api/client';

export interface StorageFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  fileKey: string;
  createdAt: string;
}

export const storageFileService = {
  list: () => api.get<{ data: StorageFile[] }>('/storage/files'),
  get: (id: string) => api.get<{ data: StorageFile }>(`/storage/files/${id}`),
  getDownloadUrl: (id: string) =>
    api.get<{ data: { downloadUrl: string } }>(`/storage/files/${id}/download`),
  remove: (id: string) => api.delete(`/storage/files/${id}`),
};
