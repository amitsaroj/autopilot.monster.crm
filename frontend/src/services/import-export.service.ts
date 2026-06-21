import api from '../lib/api/client';

export interface DataJob {
  id: string;
  type: string;
  status: string;
  entityType?: string;
  fileKey?: string;
  downloadUrl?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export const importExportService = {
  startImport: (entityType: string, fileKey: string) =>
    api.post<{ data: DataJob }>('/import', { entityType, fileKey }),

  getImportJob: (jobId: string) => api.get<{ data: DataJob }>(`/import/${jobId}`),

  getImportHistory: () => api.get<{ data: DataJob[] }>('/import/history'),

  startExport: (entityType: string, format: 'csv' | 'json' = 'csv') =>
    api.post<{ data: DataJob }>('/export', { entityType, format }),

  getExportJob: (jobId: string) => api.get<{ data: DataJob }>(`/export/${jobId}`),

  getExportHistory: () => api.get<{ data: DataJob[] }>('/export/history'),

  triggerBackup: () => api.post<{ data: DataJob }>('/backup'),

  getBackupHistory: () => api.get<{ data: DataJob[] }>('/backup'),

  getBackupDownload: (id: string) =>
    api.get<{ data: { downloadUrl: string; fileKey: string } }>(`/backup/${id}/download`),

  requestRestore: (id: string) => api.post(`/backup/${id}/restore`),

  getPresignedUpload: (filename: string, mimeType: string) =>
    api.post<{ data: { uploadUrl: string; fileKey: string; expiresIn: number } }>(
      '/storage/files/upload',
      { filename, mimeType },
    ),
};
