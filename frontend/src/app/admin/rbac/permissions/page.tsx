"use client";

import { useState, useEffect } from 'react';
import { Lock, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { rbacService, type Permission } from '@/services/rbac.service';

export default function AdminRBACPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await rbacService.getPermissions();
        const payload = res.data?.data ?? res.data;
        const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
        setPermissions(rows);
      } catch {
        toast.error('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = permissions.filter(p =>
    p.resource.toLowerCase().includes(search.toLowerCase()) ||
    p.action.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const resources = [...new Set(permissions.map(p => p.resource))];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Permissions</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">RBAC Permission Matrix</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {resources.slice(0, 8).map(resource => (
          <div key={resource} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{resource}</p>
            <p className="text-xl font-black text-white mt-1">
              {permissions.filter(p => p.resource === resource).length}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search permissions..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Permission', 'Resource', 'Action', 'Description'].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(perm => (
              <tr key={perm.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-xs font-mono font-bold text-indigo-300 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> {perm.name}
                </td>
                <td className="px-5 py-4 text-xs text-gray-300">{perm.resource}</td>
                <td className="px-5 py-4 text-xs text-gray-400">{perm.action}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{perm.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
