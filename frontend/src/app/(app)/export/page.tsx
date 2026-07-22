'use client';

import { useEffect, useState } from 'react';
import {
  Download,
  FileDown,
  Table,
  FileText,
  Archive,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { importExportService, type DataJob } from '@/services/import-export.service';
import { parseApiData } from '@/lib/api/parse-response';

const ENTITY_OPTIONS = ['contacts', 'leads', 'companies', 'deals', 'activities'] as const;

export default function ExportGlobalPage() {
  const [entityType, setEntityType] = useState<string>('contacts');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [history, setHistory] = useState<DataJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await importExportService.getExportHistory();
      setHistory(parseApiData<DataJob[]>(res) ?? []);
    } catch {
      setHistory([]);
      setError('Unable to load export history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const startExport = async (entity: string, fmt: 'csv' | 'json' = format) => {
    setStarting(true);
    try {
      await importExportService.startExport(entity, fmt);
      toast.success('Export started');
      await loadHistory();
    } catch {
      toast.error('Failed to start export');
    } finally {
      setStarting(false);
    }
  };

  const startBackup = async () => {
    setStarting(true);
    try {
      await importExportService.triggerBackup();
      toast.success('Backup started');
      await loadHistory();
    } catch {
      toast.error('Failed to start backup');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Export Data</h1>
        <p className="page-description">Download workspace data for backup or analysis</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'CSV Export',
            desc: 'Contacts, Leads, Deals, Activities',
            icon: Table,
            format: '.csv' as const,
            action: () => void startExport(entityType, 'csv'),
          },
          {
            label: 'JSON Export',
            desc: 'Structured dump for selected entity',
            icon: FileText,
            format: '.json' as const,
            action: () => void startExport(entityType, 'json'),
          },
          {
            label: 'Full Backup',
            desc: 'Complete workspace backup job',
            icon: Archive,
            format: '.json' as const,
            action: () => void startBackup(),
          },
        ].map((e) => (
          <button
            key={e.label}
            type="button"
            disabled={starting}
            onClick={e.action}
            className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/40 transition-colors text-left disabled:opacity-50"
          >
            <div className="p-3 rounded-xl bg-[hsl(246,80%,60%)]/10 w-fit mb-3">
              <e.icon className="h-6 w-6 text-[hsl(246,80%,60%)]" />
            </div>
            <p className="font-semibold text-foreground">{e.label}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{e.desc}</p>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {e.format}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold">Custom Export</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Data Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            >
              {ENTITY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          disabled={starting}
          onClick={() => void startExport(entityType, format)}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Generate Export
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Exports</h2>
          <button type="button" onClick={() => void loadHistory()} className="text-xs text-muted-foreground hover:text-foreground">
            Refresh
          </button>
        </div>
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && error && (
          <div className="p-5 text-sm text-muted-foreground flex gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}
        {!loading && !error && history.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">No export jobs yet</p>
        )}
        {!loading && !error && history.length > 0 && (
          <div className="divide-y divide-border">
            {history.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4">
                <FileDown className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {e.entityType || e.type} · {e.status}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}
                    {e.errorMessage ? ` · ${e.errorMessage}` : ''}
                  </p>
                </div>
                {(e.status === 'COMPLETED' || e.status === 'SUCCESS') && (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <CheckCircle className="h-3 w-3" />
                    Ready
                  </span>
                )}
                {e.downloadUrl && (
                  <a
                    href={e.downloadUrl}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
