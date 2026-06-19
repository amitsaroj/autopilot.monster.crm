"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, Filter, Plus, MoreVertical,
  ExternalLink, ShieldAlert, Globe, Calendar,
  CheckCircle2, Clock, Trash2, Loader2, ArrowRight, PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { adminTenantsService } from '@/services/admin-tenants.service';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'DELETED';
  planId?: string;
  customDomain?: string;
  createdAt: string;
}

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchTenants = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const response = await adminTenantsService.findAll({ search: query, limit: 50 });
      const payload = response?.data ?? response;
      setTenants(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch {
      toast.error('Failed to sync workspace data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchTenants(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchTenants]);

  const handleSuspend = async (tenant: Tenant) => {
    setActionId(tenant.id);
    try {
      await adminTenantsService.suspend(tenant.id);
      toast.success(`${tenant.name} suspended`);
      await fetchTenants(search);
    } catch {
      toast.error('Failed to suspend workspace');
    } finally {
      setActionId(null);
    }
  };

  const handleActivate = async (tenant: Tenant) => {
    setActionId(tenant.id);
    try {
      await adminTenantsService.activate(tenant.id);
      toast.success(`${tenant.name} activated`);
      await fetchTenants(search);
    } catch {
      toast.error('Failed to activate workspace');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (tenant: Tenant) => {
    if (!window.confirm(`Delete workspace "${tenant.name}"? This cannot be undone.`)) {
      return;
    }
    setActionId(tenant.id);
    try {
      await adminTenantsService.remove(tenant.id);
      toast.success(`${tenant.name} deleted`);
      await fetchTenants(search);
    } catch {
      toast.error('Failed to delete workspace');
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
      SUSPENDED: 'bg-red-500/10 text-red-500 border-red-500/20',
      TRIAL: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      DELETED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    const icons: Record<string, typeof CheckCircle2> = {
      ACTIVE: CheckCircle2,
      SUSPENDED: ShieldAlert,
      TRIAL: Clock,
      DELETED: Trash2,
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${colors[status] ?? colors.TRIAL}`}>
        <Icon className="w-3 h-3" /> {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Workspace Orchestration</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Managed Clusters ({tenants.length})</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
           <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Provision Tenant
           </button>
           <button className="p-3 bg-white/[0.05] border border-white/10 rounded-xl text-white hover:bg-white/[0.1] transition-all">
              <Filter className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all">
         <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
         <input
            type="text"
            placeholder="Search by workspace name, slug, or cluster ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
         />
         {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace Identity</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Status</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Infrastructure</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Provision Date</th>
                     <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                {tenant.name.substring(0, 2).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{tenant.name}</p>
                                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{tenant.slug}.autopilotmonster.com</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          {getStatusBadge(tenant.status)}
                       </td>
                       <td className="px-6 py-5">
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Globe className="w-3 h-3" /> {tenant.customDomain || 'No Custom Domain'}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-tighter">
                                <Building2 className="w-3 h-3" /> {tenant.planId || 'Basic Plan'}
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                             <Calendar className="w-3.5 h-3.5" /> {new Date(tenant.createdAt).toLocaleDateString()}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                             {tenant.status === 'SUSPENDED' ? (
                               <button
                                 disabled={actionId === tenant.id}
                                 onClick={() => handleActivate(tenant)}
                                 className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-green-400 hover:bg-green-500/20 hover:border-green-500/30 transition-all disabled:opacity-50"
                                 title="Activate"
                               >
                                 {actionId === tenant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                               </button>
                             ) : tenant.status !== 'DELETED' ? (
                               <button
                                 disabled={actionId === tenant.id}
                                 onClick={() => handleSuspend(tenant)}
                                 className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all disabled:opacity-50"
                                 title="Suspend"
                               >
                                 {actionId === tenant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                               </button>
                             ) : null}
                             <button className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all">
                                <ExternalLink className="w-4 h-4" />
                             </button>
                             {tenant.status !== 'DELETED' && (
                               <button
                                 disabled={actionId === tenant.id}
                                 onClick={() => handleDelete(tenant)}
                                 className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-50"
                                 title="Delete"
                               >
                                 {actionId === tenant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                               </button>
                             )}
                             <button className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                         <div className="flex flex-col items-center gap-4 text-gray-600">
                            <Building2 className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium">No workspaces found matching your search</p>
                            <button onClick={() => setSearch('')} className="text-indigo-400 text-xs font-black uppercase tracking-widest hover:underline">Clear Search</button>
                         </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>

         <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between text-xs text-gray-600">
            <span>Showing {tenants.length} of {tenants.length} Entities</span>
            <div className="flex items-center gap-4">
               <button disabled className="hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors"><ArrowRight className="w-3 h-3 rotate-180" /> Previous</button>
               <button disabled className="hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors">Next <ArrowRight className="w-3 h-3" /></button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group">
            <h3 className="text-lg font-black text-white mb-2">Global Limit Orchestration</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">Set cluster-wide resource ceilings for storage, task execution minutes, and AI token consumption across all active tenants.</p>
            <Link href="/superadmin/plans" className="text-indigo-400 text-xs font-black flex items-center gap-2 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
               Configure Ceilings <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
         <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/20 transition-all group">
            <h3 className="text-lg font-black text-white mb-2">Platform Pricing Logic</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">Modify plan DTOs, update price per unit mappings, and provision promotional custom plans for enterprise partners.</p>
            <Link href="/superadmin/plans" className="text-amber-400 text-xs font-black flex items-center gap-2 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
               Manage Plan Schema <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      </div>

    </div>
  );
}
