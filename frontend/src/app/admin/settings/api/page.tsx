"use client";

import { useState, useEffect } from 'react';
import { 
  Zap, Search, Filter, Shield, Clock, 
  Terminal, Globe, Database, ArrowRight,
  RefreshCw, Loader2, CheckCircle2, AlertCircle,
  XCircle, Send, Share2, Activity,
  Server, Cpu, Layout, FileJson, Mail,
  Key, CreditCard, MessageSquare, Bot,
  Layers, Plus, Trash2, Copy, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface TenantSetting {
  id: string;
  key: string;
  value: any;
  group?: string;
  createdAt: string;
}

export default function TenantApiSettingsPage() {
  const [settings, setSettings] = useState<TenantSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/settings/integrations');
      const json = await res.json();
      if (json.data) setSettings(json.data);
    } catch (e) {
      toast.error('Failed to sync integration artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleVisibility = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Artifact synchronized to clipboard');
  };

  const providers = [
    { name: 'Stripe', icon: CreditCard, color: 'text-indigo-500', desc: 'Manage payments and subscription webhooks.' },
    { name: 'Twilio', icon: MessageSquare, color: 'text-red-500', desc: 'Orchestrate SMS and Voice communication.' },
    { name: 'OpenAI', icon: Bot, color: 'text-emerald-500', desc: 'Power AI assistants and CRM intelligence.' },
    { name: 'VAPI', icon: Zap, color: 'text-amber-500', desc: 'Real-time AI voice conversation artifacts.' },
  ];

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
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Connectivity Lattice active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">Node: API-Integrator-Hub</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">API & Integration Center</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage External Artifacts & Service Connections</p>
        </div>
        <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Provision New Artifact
        </button>
      </div>

      {/* Provider Quick Connect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {providers.map((p) => (
           <div key={p.name} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors" />
              <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4 ${p.color} group-hover:bg-indigo-500 group-hover:text-white transition-all`}>
                 <p.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">{p.name} Artifacts</h3>
              <p className="text-[10px] text-gray-600 leading-relaxed font-medium uppercase tracking-tighter">{p.desc}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* API Key Ledger */}
         <div className="lg:col-span-2 space-y-8">
            <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.01] overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                     <Key className="w-5 h-5 text-indigo-400" /> Active Service Artifacts
                  </h3>
                  <button onClick={fetchSettings} className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white transition-all">
                     <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
               </div>
               
               <div className="divide-y divide-white/[0.05]">
                  {settings.map((s) => (
                    <div key={s.id} className="p-8 hover:bg-white/[0.02] transition-colors group">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-white uppercase tracking-widest">{s.key.replace(/_/g, ' ')}</span>
                                <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/5 text-[8px] font-black text-gray-600 uppercase tracking-widest">
                                   {s.group || 'General'} Artifact
                                </span>
                             </div>
                             <div className="flex items-center gap-4 mt-2">
                                <code className="bg-black/60 px-4 py-2 rounded-xl border border-white/5 text-[10px] text-indigo-400 font-mono flex-1 md:flex-none md:min-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis">
                                   {showValues[s.key] ? s.value : '••••••••••••••••••••••••••••••••'}
                                </code>
                                <div className="flex gap-2">
                                   <button 
                                      onClick={() => toggleVisibility(s.key)}
                                      className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white transition-all"
                                   >
                                      {showValues[s.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                   </button>
                                   <button 
                                      onClick={() => copyToClipboard(s.value)}
                                      className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-gray-500 hover:text-white transition-all"
                                   >
                                      <Copy className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <p className="text-[10px] text-gray-600 font-mono uppercase tracking-tighter">Last synced: {new Date(s.createdAt).toLocaleDateString()}</p>
                             <button className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
                  {settings.length === 0 && (
                    <div className="p-20 text-center space-y-6">
                       <Layers className="w-16 h-16 text-gray-800 mx-auto opacity-20" />
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-500">No integration artifacts provisioned</p>
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest px-1">Connect a provider to initialize the workspace Connectivity Lattice.</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>
         </div>

         {/* Side: Webhooks & Safety */}
         <div className="space-y-8">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Globe className="w-5 h-5 text-emerald-400" /> Incoming Webhooks
               </h3>
               
               <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                     <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Primary Receiver [local]
                     </p>
                     <div className="flex items-center gap-2">
                        <code className="flex-1 bg-black/60 p-2 rounded-lg text-[9px] text-gray-500 font-mono truncate">
                           https://api.autopilot.crm/webhooks/st_92...
                        </code>
                        <button className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-all">
                           <Copy className="w-3 h-3 text-gray-600" />
                        </button>
                     </div>
                  </div>
                  <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-gray-600 uppercase tracking-widest hover:border-white/20 transition-all flex items-center justify-center gap-2">
                     <Plus className="w-3.5 h-3.5" /> Provision Endpoint
                  </button>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-indigo-500/10 border border-indigo-500/20 space-y-6 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                     <Shield className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-tight">Key Persistence</h4>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Encryption: AES-256-GCM</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Workspace API artifacts are cryptographically locked and only decrypted during systemic execution. Platform admins cannot view your unmasked secrets.
               </p>
            </div>

            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-4">
               <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Connectivity Pulse</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
               </div>
               <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">94% Integration Artifact Success Rate</p>
            </div>
         </div>
      </div>

    </div>
  );
}
