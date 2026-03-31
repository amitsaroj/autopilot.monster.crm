'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  MoreVertical, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Filter,
  ArrowRight
} from 'lucide-react';
import { adminTenantsService } from '@/services/admin-tenants.service';

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const res = await adminTenantsService.findAll();
      setTenants(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Tenant Management</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SuperAdmin / Global Access Control</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Provision Tenant
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, slug, or ID..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-colors">
              <Filter className="h-4 w-4 text-muted-foreground" />
           </button>
           <div className="h-6 w-px bg-border/40 mx-1" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">Displaying {filteredTenants.length} Units</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/20 text-left bg-muted/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Organization</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Subscription</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-bold">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                   <td colSpan={4} className="px-6 py-4 h-16 bg-muted/5" />
                </tr>
              ))
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                   <Building2 className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Entities Found</p>
                </td>
              </tr>
            ) : (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                        <Building2 className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{tenant.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{tenant.slug}.autopilot.monster</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full",
                        tenant.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                        tenant.status === 'SUSPENDED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                        'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                      )} />
                      <span className={cn("text-[10px] uppercase tracking-widest font-black",
                         tenant.status === 'ACTIVE' ? 'text-green-500' : 
                         tenant.status === 'SUSPENDED' ? 'text-red-500' : 
                         'text-yellow-500'
                      )}>{tenant.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black uppercase tracking-tighter">{tenant.planId || 'N/A'}</p>
                    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">Next Billing: Apr 12</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/superadmin/tenants/${tenant.id}`}
                        className="p-2 rounded-lg hover:bg-brand/10 hover:text-brand transition-all border border-transparent hover:border-brand/20"
                      >
                         <ShieldCheck className="h-4 w-4" />
                      </Link>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
