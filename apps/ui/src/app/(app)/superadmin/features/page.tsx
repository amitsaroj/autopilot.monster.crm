'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Edit3,
  ToggleLeft,
  ToggleRight,
  Filter,
  MoreVertical
} from 'lucide-react';
import { adminPlansService } from '@/services/admin-plans.service';

export default function SuperAdminFeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      // Assuming a generic features retrieval exists or using plans service
      const res = await adminPlansService.findAll();
      // Extract unique features across plans for management
      const allFeatures = res.data?.flatMap((p: any) => p.features) || [];
      const uniqueFeatures = Array.from(new Map(allFeatures.map((f: any) => [f.key, f])).values());
      setFeatures(uniqueFeatures);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Feature Inventory</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Platform Control / Capability Flags</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Define Feature
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search feature flags..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{filteredFeatures.length} Definitions</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted/20 border border-border/20 animate-pulse" />
          ))
        ) : filteredFeatures.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <Zap className="h-12 w-12 mx-auto mb-4 opacity-10" />
             <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Feature Definitions Found</p>
          </div>
        ) : (
          filteredFeatures.map((feature) => (
            <div key={feature.id} className="group p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md hover:border-brand/30 transition-all cursor-default">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                       <ShieldCheck className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{feature.name}</h3>
                       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{feature.key}</p>
                    </div>
                 </div>
                 <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                 </button>
              </div>
              
              <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-6 font-medium leading-relaxed">
                {feature.description || 'Global switch for protocol functionality and application capability.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/10">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Global Active</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                       <Edit3 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                       <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
