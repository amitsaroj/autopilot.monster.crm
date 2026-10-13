'use client';

import { useEffect, useState } from 'react';
import { FileSearch, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminLogsService } from '@/services/sub-admin-logs.service';

interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? fallback) as T;
}

export default function SubAdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await subAdminLogsService.getLogs({ limit: 100 });
        setLogs(unwrap<AuditLogEntry[]>(res, []));
      } catch {
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">Logs</h1>
        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
          Tenant Audit Trail
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: logs.length },
          {
            label: 'Distinct Actions',
            value: [...new Set(logs.map((l) => l.action))].length,
          },
          {
            label: 'Distinct Resources',
            value: [...new Set(logs.map((l) => l.resource))].length,
          },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter by action or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center">
          <FileSearch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No audit events match this workspace yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border divide-y divide-white/[0.05] overflow-hidden">
          {filtered.map((log) => (
            <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.03] transition-all">
              <div className="p-2.5 rounded-xl bg-blue-500/10 shrink-0">
                <FileSearch className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{log.action}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {log.resource}
                  {log.resourceId ? ` · ${log.resourceId}` : ''}
                  {log.ipAddress ? ` · ${log.ipAddress}` : ''}
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide shrink-0">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
