'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  MoreVertical,
  Zap,
  Tag,
  Filter
} from 'lucide-react';
import { rbacService } from '@/services/rbac.service';

export default function SuperAdminPermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const res = await rbacService.getPermissions();
      setPermissions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Global Permissions</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Resource Protocol / Access Atoms</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Add Permission
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search resources..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{filteredPermissions.length} Definitions Active</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/20 text-left bg-muted/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Atomic Action</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Resource Scope</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-bold">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                   <td colSpan={3} className="px-6 py-4 h-16 bg-muted/5" />
                </tr>
              ))
            ) : filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center">
                   <Zap className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Permissions Found</p>
                </td>
              </tr>
            ) : (
              filteredPermissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                        <Tag className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{perm.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{perm.action}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black bg-muted/50 px-3 py-1 rounded-full border border-border/20 uppercase tracking-widest">{perm.resource}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <Edit3 className="h-4 w-4 text-muted-foreground" />
                       </button>
                       <button className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
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
