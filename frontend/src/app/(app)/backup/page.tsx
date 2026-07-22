'use client';

import { useEffect, useState } from 'react';
import {
  Archive,
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  Database,
  HardDrive,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { importExportService, type DataJob } from '@/services/import-export.service';
import { parseApiData } from '@/lib/api/parse-response';

function formatSize(bytes?: number): string {
  if (bytes == null || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function jobSize(job: DataJob): string {
  const meta = job.metadata as { size?: number; fileSize?: number } | undefined;
  return formatSize(meta?.size ?? meta?.fileSize);
}

export default function BackupPage() {
  const [backups, setBackups] = useState<DataJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await importExportService.getBackupHistory();
      setBackups(parseApiData<DataJob[]>(res) ?? []);
    } catch {
      setBackups([]);
      setError('Unable to load backup history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await importExportService.triggerBackup();
      toast.success('Backup started');
      await load();
    } catch {
      toast.error('Failed to start backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (id: string) => {
    setActionId(id);
    try {
      const res = await importExportService.getBackupDownload(id);
      const url = parseApiData<{ downloadUrl: string }>(res)?.downloadUrl ?? res.data?.data?.downloadUrl;
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('Download URL unavailable');
      }
    } catch {
      toast.error('Failed to download backup');
    } finally {
      setActionId(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (
      !confirm(
        'Restoring a backup will overwrite your current data. This action cannot be undone. Continue?',
      )
    ) {
      return;
    }
    setActionId(id);
    try {
      await importExportService.requestRestore(id);
      toast.success('Restore requested');
    } catch {
      toast.error('Failed to request restore');
    } finally {
      setActionId(null);
    }
  };

  const completedCount = backups.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'SUCCESS',
  ).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Backup & Restore</h1>
          <p className="page-description">
            Create backups and restore previous workspace snapshots
          </p>
        </div>
        <button
          type="button"
          disabled={creating}
          onClick={() => void handleCreateBackup()}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create Backup Now
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-muted text-blue-400">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{loading ? '—' : backups.length}</p>
            <p className="text-xs text-muted-foreground">Total Backups</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="p-3 rounded-lg bg-muted text-purple-400">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              {loading ? '—' : completedCount}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Backup History</h2>
          <button
            type="button"
            onClick={() => void load()}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
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

        {!loading && !error && backups.length === 0 && (
          <p className="p-8 text-sm text-muted-foreground text-center">No backups yet.</p>
        )}

        {!loading && !error && backups.length > 0 && (
          <div className="divide-y divide-border">
            {backups.map((b) => {
              const isComplete = b.status === 'COMPLETED' || b.status === 'SUCCESS';
              const busy = actionId === b.id;
              return (
                <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {b.type || 'Backup'} · {b.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.status} · {jobSize(b)} ·{' '}
                      {b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  {isComplete && (
                    <span className="flex items-center gap-1 text-xs text-green-500 shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </span>
                  )}
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRestore(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Restore
                    </button>
                    <button
                      type="button"
                      disabled={busy || !isComplete}
                      onClick={() => void handleDownload(b.id)}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                      title="Download backup"
                    >
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
        <Shield className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Restoring a backup will overwrite your current data. This action cannot be undone.
          Download a fresh backup before restoring.
        </p>
      </div>
    </div>
  );
}
