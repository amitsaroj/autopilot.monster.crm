"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  ShoppingCart, Rocket, Boxes, Database
} from 'lucide-react';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  isPremium: boolean;
  status: string;
  isInstalled?: boolean;
}

export default function TenantMarketplacePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/sub-admin/marketplace/discover');
      const json = await res.json();
      if (json.data) setPlugins(json.data);
    } catch (e) {
      toast.error('Failed to synchronize marketplace discovery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleInstall = async (id: string) => {
    setInstalling(id);
    try {
      const res = await fetch(`/api/v1/sub-admin/marketplace/install/${id}`, { method: 'POST' });
      if (res.ok) {
        toast.success('Marketplace vector deployed successfully');
        fetchPlugins();
      } else {
        toast.error('Module installation failure');
      }
    } catch (e) {
      toast.error('Network bridge failure during deployment');
    } finally {
      setInstalling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Discovery Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Hub: Workspace Extensions</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Feature Marketplace</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Discover & Provision New Workspace Functional Capabilities</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={fetchPlugins} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Power-Up Search
           </button>
        </div>
      </div>

      {/* Hero: Discovery Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { name: 'Automations', count: 12, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
           { name: 'Integrations', count: 24, icon: LinkIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
           { name: 'AI Models', count: 8, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
         ].map((cat) => (
           <div key={cat.name} className={`p-8 rounded-[40px] border flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all ${cat.bg}`}>
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter font-sans">{cat.name}</h3>
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">{cat.count} Artifacts Available</p>
              </div>
              <cat.icon className={`w-10 h-10 ${cat.color} opacity-40 group-hover:opacity-100 transition-all`} />
           </div>
         ))}
      </div>

      {/* Discovery Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {plugins.map((plugin) => (
           <div key={plugin.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
              
              <div>
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                       <Package className="w-8 h-8" />
                    </div>
                    {plugin.isPremium && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">Premium</span>
                    )}
                 </div>

                 <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{plugin.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">v{plugin.version} • {plugin.category} Artifact</span>
                    </div>
                 </div>

                 <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-10 font-medium">
                    {plugin.description || 'Provision this functional capability to enhance your workspace operational vector and communication lattice.'}
                 </p>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-600 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" /> 4.9 Artifacts/5</span>
                    <span className="text-gray-600 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400" /> 2k Active Users</span>
                 </div>

                 {plugin.isInstalled ? (
                    <button className="w-full py-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-default">
                       <ShieldCheck className="w-4 h-4" /> Functional Artifact Synchronized
                    </button>
                 ) : (
                    <button 
                       onClick={() => handleInstall(plugin.id)}
                       disabled={installing === plugin.id}
                       className="w-full py-4 rounded-3xl bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95"
                    >
                       {installing === plugin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                       Provision Module Artifact
                    </button>
                 )}
              </div>
           </div>
         ))}

         {/* Blueprint Placeholder if few plugins */}
         {plugins.length < 5 && (
            <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-6">
               <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700">
                  <Boxes className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">More Modules Incoming</h3>
                  <p className="text-xs text-gray-600 max-w-[200px] mx-auto leading-relaxed mt-2 uppercase tracking-widest font-black opacity-30">Persistence Discovery Status: Scanning</p>
               </div>
            </div>
         )}
      </div>

      {/* Marketplace Infrastructure Overview */}
      <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-10 group">
         <div className="flex items-center gap-8">
            <div className="p-6 rounded-3xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
               <Layers className="w-10 h-10" />
            </div>
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Modular Execution Environment</h3>
               <p className="text-sm text-gray-500 max-w-xl font-medium">
                  Extend your workspace with sandboxed functional modules. All marketplace artifacts are vetted for security and performance by the platform core.
               </p>
            </div>
         </div>
         <button className="px-8 py-4 bg-white/[0.05] border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/[0.1] shrink-0">Review Installed Extensions</button>
      </div>

    </div>
  );
}
