'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileSearch, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminPermissionsService } from '@/services/sub-admin-permissions.service';

interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (Array.isArray(payload) ? payload : (payload?.data ?? fallback)) as T;
}

export default function SubAdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await subAdminPermissionsService.getPermissions();
        setPermissions(unwrap<Permission[]>(res, []));
      } catch {
        toast.error('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.resource.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of filtered) {
      const list = map.get(p.resource) ?? [];
      list.push(p);
      map.set(p.resource, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Permissions</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Granular Permission Catalog · Read Only
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Permissions', value: permissions.length },
          { label: 'Resources', value: new Set(permissions.map((p) => p.resource)).size },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {s.label}
            </p>
            <p className="text-2xl font-black text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by permission or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
        />
      </div>

      {grouped.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center text-gray-500 text-sm">
          No permissions found.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([resource, perms]) => (
            <div
              key={resource}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10">
                  <FileSearch className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-widest">
                  {resource}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {perms.map((p) => (
                  <span
                    key={p.id}
                    title={p.description}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400 font-black uppercase tracking-widest"
                  >
                    {p.action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
