'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Download,
  Upload,
  Archive,
  Shield,
  Loader2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { importExportService, type DataJob } from '@/services/import-export.service';
import { parseApiData } from '@/lib/api/parse-response';

const ENTITY_OPTIONS = ['contacts', 'leads', 'companies', 'deals', 'activities'] as const;

export default function SettingsDataPage() {
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [exports, setExports] = useState<DataJob[]>([]);
  const [backups, setBackups] = useState<DataJob[]>([]);
  const [entityType, setEntityType] = useState<string>('contacts');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const load = async () => {
    setLoading(true);
    try {
      const [exportRes, backupRes] = await Promise.all([
        importExportService.getExportHistory(),
        importExportService.getBackupHistory().catch(() => null),
      ]);
      setExports(parseApiData<DataJob[]>(exportRes) ?? []);
      setBackups(backupRes ? (parseApiData<DataJob[]>(backupRes) ?? []) : []);
    } catch {
      setExports([]);
      setBackups([]);
      toast.error('Unable to load data & privacy jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const startExport = async () => {
    setStarting(true);
    try {
      await importExportService.startExport(entityType, format);
      toast.success('Export started');
      await load();
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
      await load();
    } catch {
      toast.error('Failed to start backup');
    } finally {
      setStarting(false);
    }
  };

  const recentJobs = [...exports, ...backups]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Data & Privacy</h1>
        <p className="page-description">
          Export workspace data, run backups, and manage retention workflows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/export"
          className="rounded-xl border border-border bg-card p-5 hover:bg-muted/40 transition-colors"
        >
          <Download className="h-5 w-5 text-[hsl(246,80%,60%)] mb-3" />
          <p className="text-sm font-semibold text-foreground">Export center</p>
          <p className="text-xs text-muted-foreground mt-1">Full export history and formats</p>
        </Link>
        <Link
          href="/import"
          className="rounded-xl border border-border bg-card p-5 hover:bg-muted/40 transition-colors"
        >
          <Upload className="h-5 w-5 text-[hsl(246,80%,60%)] mb-3" />
          <p className="text-sm font-semibold text-foreground">Import data</p>
          <p className="text-xs text-muted-foreground mt-1">Upload contacts, leads, and deals</p>
        </Link>
        <Link
          href="/backup"
          className="rounded-xl border border-border bg-card p-5 hover:bg-muted/40 transition-colors"
        >
          <Archive className="h-5 w-5 text-[hsl(246,80%,60%)] mb-3" />
          <p className="text-sm font-semibold text-foreground">Backups</p>
          <p className="text-xs text-muted-foreground mt-1">Workspace backup and restore</p>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-[hsl(246,80%,60%)]" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Quick export</h2>
            <p className="text-xs text-muted-foreground">
              Start a GDPR-ready export for a selected entity
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {ENTITY_OPTIONS.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button
            type="button"
            disabled={starting}
            onClick={() => void startExport()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(246,80%,60%)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </button>
        </div>
        <button
          type="button"
          disabled={starting}
          onClick={() => void startBackup()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted/40 disabled:opacity-60"
        >
          <Archive className="h-4 w-4" />
          Start full backup
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[hsl(246,80%,60%)]" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Privacy controls</h2>
            <p className="text-xs text-muted-foreground">
              Exports and backups are tenant-scoped. Use export for subject-access requests and
              backup for retention.
            </p>
          </div>
        </div>
        <Link
          href="/settings/security"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(246,80%,60%)]"
        >
          Review security settings <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent data jobs</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recentJobs.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No export or backup jobs yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentJobs.map((job) => (
              <li key={job.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {job.type}
                    {job.entityType ? ` · ${job.entityType}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
