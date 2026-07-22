'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { importExportService, type DataJob } from '@/services/import-export.service';
import { parseApiData } from '@/lib/api/parse-response';

const ENTITY_OPTIONS = [
  { label: 'Contacts', value: 'contacts' },
  { label: 'Leads', value: 'leads' },
  { label: 'Companies', value: 'companies' },
  { label: 'Deals', value: 'deals' },
  { label: 'Products', value: 'products' },
  { label: 'Tasks', value: 'tasks' },
] as const;

export default function ImportGlobalPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entityType, setEntityType] = useState<string>('contacts');
  const [history, setHistory] = useState<DataJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await importExportService.getImportHistory();
      setHistory(parseApiData<DataJob[]>(res) ?? []);
    } catch {
      setHistory([]);
      setError('Unable to load import history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const presigned = await importExportService.getPresignedUpload(file.name, file.type || 'text/csv');
      const { uploadUrl, fileKey } = parseApiData<{ uploadUrl: string; fileKey: string }>(presigned) ?? {
        uploadUrl: '',
        fileKey: '',
      };
      if (!uploadUrl || !fileKey) throw new Error('Missing upload URL');

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'text/csv' },
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      await importExportService.startImport(entityType, fileKey);
      toast.success('Import started');
      await loadHistory();
    } catch {
      toast.error('Failed to start import');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Import Data</h1>
        <p className="page-description">Bulk import contacts, leads, companies, deals from CSV, Excel, or JSON</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">1. Choose data type</h2>
        <div className="grid grid-cols-3 gap-3">
          {ENTITY_OPTIONS.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => setEntityType(e.value)}
              className={`p-4 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                entityType === e.value
                  ? 'border-[hsl(246,80%,60%)] bg-[hsl(246,80%,60%)]/5 text-[hsl(246,80%,60%)]'
                  : 'border-border hover:border-[hsl(246,80%,60%)]/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">2. Upload file</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.json,text/csv,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <div
          className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-[hsl(246,80%,60%)]/40 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          )}
          <p className="text-sm font-medium text-foreground">
            {uploading ? 'Uploading…' : 'Drop your file here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Supported: CSV, XLSX, JSON · Max 10 MB</p>
          <button
            type="button"
            disabled={uploading}
            className="mt-4 px-4 py-2 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg hover:bg-[hsl(246,80%,55%)] transition-colors disabled:opacity-50"
          >
            Browse Files
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Selected entity: <span className="font-medium text-foreground">{entityType}</span>
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(246,80%,60%)]/20 bg-[hsl(246,80%,60%)]/5 p-4 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-[hsl(246,80%,60%)] shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Field Mapping</p>
          <p className="mt-0.5">Upload starts an import job. Use entity CSV modals for guided mapping when available.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent Imports</h2>
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
          <p className="p-5 text-sm text-muted-foreground">No import jobs yet</p>
        )}
        {!loading && !error && history.length > 0 && (
          <div className="divide-y divide-border">
            {history.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {r.entityType || r.type} · {r.status}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {r.status === 'COMPLETED' || r.status === 'SUCCESS' ? (
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </span>
                    ) : r.status === 'FAILED' ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <X className="h-3 w-3" />
                        Failed
                      </span>
                    ) : (
                      <span>{r.status}</span>
                    )}
                    <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
