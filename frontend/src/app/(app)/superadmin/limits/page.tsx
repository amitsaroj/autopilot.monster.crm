'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  BarChart3, 
  Trash2, 
  Edit3,
  Filter,
  MoreVertical,
  Activity
} from 'lucide-react';
import { adminPlansService } from '@/services/admin-plans.service';

export default function SuperAdminLimitsPage() {
  const [limits, setLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      setLoading(true);
      const res = await adminPlansService.findAll();
      const allLimits = res.data?.flatMap((p: any) => p.limits) || [];
      const uniqueLimits = Array.from(new Map(allLimits.map((l: any) => [l.key, l])).values());
      setLimits(uniqueLimits);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLimits = limits.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Quota & Limits</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Resource Governance / Usage Constraints</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Set Limit
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search resource keys..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{filteredLimits.length} Constraints Active</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border/20 text-left bg-muted/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Resource Constraint</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Global default</th>
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
            ) : filteredLimits.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center">
                   <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Constraints Defined</p>
                </td>
              </tr>
            ) : (
              filteredLimits.map((limit) => (
                <tr key={limit.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                        <Activity className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{limit.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest tracking-widest">{limit.key}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black bg-muted/50 px-3 py-1 rounded-full border border-border/20 uppercase tracking-widest">{limit.value || 'Unlimited'} Units</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 rounded-lg hover:bg-brand/10 hover:text-brand transition-all border border-transparent hover:border-brand/20">
                          <Edit3 className="h-4 w-4" />
                       </button>
                       <button className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
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
