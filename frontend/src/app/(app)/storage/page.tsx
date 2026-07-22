'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, File, Trash2, Download, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { storageFileService, type StorageFile } from '@/services/storage-file.service';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function fileTypeLabel(mime: string): string {
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('word') || mime.includes('document')) return 'DOC';
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'PPT';
  if (mime.startsWith('image/')) return 'IMG';
  if (mime.includes('csv')) return 'CSV';
  if (mime.includes('json')) return 'JSON';
  const ext = mime.split('/').pop();
  return ext ? ext.toUpperCase().slice(0, 4) : 'FILE';
}

function formatModified(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function StoragePage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storageFileService.list();
      setFiles(res.data?.data ?? []);
    } catch {
      setFiles([]);
      setError('Unable to load files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totalBytes = files.reduce((sum, f) => sum + (f.size ?? 0), 0);

  const handleDownload = async (id: string) => {
    setActionId(id);
    try {
      const res = await storageFileService.getDownloadUrl(id);
      const url = res.data?.data?.downloadUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Download URL unavailable');
      }
    } catch {
      toast.error('Download failed');
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    setActionId(id);
    try {
      await storageFileService.remove(id);
      toast.success('File deleted');
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Storage</h1>
          <p className="page-description">
            {loading
              ? 'Loading storage…'
              : `${formatSize(totalBytes)} used · ${files.length} file${files.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Storage Usage</span>
          <span className="text-sm text-muted-foreground">
            {loading ? '—' : formatSize(totalBytes)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Object storage for workspace files and attachments
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">All Files</span>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="p-5 flex items-start gap-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              {error}
              <button
                type="button"
                onClick={() => void load()}
                className="block mt-2 text-[hsl(246,80%,60%)] hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="p-12 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No files stored yet</p>
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Modified</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((f) => {
                const busy = actionId === f.id;
                return (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <Link
                          href={`/storage/${f.id}`}
                          className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]"
                        >
                          {f.filename}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fileTypeLabel(f.mimeType)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatSize(f.size)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {f.createdAt ? formatModified(f.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleDownload(f.id)}
                          className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
                          title="Download"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                          ) : (
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleRemove(f.id)}
                          className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
