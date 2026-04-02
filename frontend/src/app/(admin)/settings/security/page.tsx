"use client";

import { useState, useEffect } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, Key, 
  Lock, Unlock, Eye, Terminal, Database, 
  Globe, RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, Smartphone, Fingerprint, 
  UserX, Save, Clock, History, MonitorCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface TenantSecurity {
  ipWhitelist?: string[];
  sessionTimeout?: number;
  twoFactorRequired?: boolean;
  memberAuditEnabled?: boolean;
}

export default function TenantSecuritySettingsPage() {
  const [settings, setSettings] = useState<TenantSecurity>({
    ipWhitelist: [],
    sessionTimeout: 120,
    twoFactorRequired: false,
    memberAuditEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/v1/sub-admin/settings');
        const json = await res.json();
        if (json.data) setSettings(json.data);
      } catch (e) {
        toast.error('Failed to sync workspace security artifacts');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/sub-admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Workspace security manifest synchronized');
      } else {
        toast.error('Failed to commit security overrides');
      }
    } catch (e) {
      toast.error('Forensic network error during commit');
    } finally {
      setSaving(false);
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
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Workspace Shield active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">Node: Sub-Security-Manifest</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Security Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Workspace-Level Security Overrides</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Commit Security Overrides
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         <div className="lg:col-span-2 space-y-10">
            
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Globe className="w-6 h-6 text-indigo-500" /> Administrative Access Control
               </h3>
               
               <p className="text-xs text-gray-500 leading-relaxed max-w-2xl font-medium">
                  Restrict workspace administrative access to authorized IP artifacts. When active, only requests originating from the specified network identifiers will be permitted to access sensitive workspace resources.
               </p>

               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <Terminal className="w-4 h-4 text-gray-500" />
                        <input 
                           type="text" 
                           placeholder="Enter authorized CIDR or IP (e.g., 192.168.1.1)"
                           className="flex-1 bg-transparent border-none outline-none text-sm text-white font-medium placeholder:text-gray-700"
                        />
                     </div>
                     <button className="px-6 py-4 bg-white/[0.05] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/[0.1] transition-all">Authorize Artifact</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                     <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        122.161.42.102 <XCircle className="w-3.5 h-3.5 cursor-pointer" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Fingerprint className="w-6 h-6 text-emerald-500" /> Workspace Compliance
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enforce 2FA Mandate</span>
                        <button 
                           onClick={() => setSettings(s => ({ ...s, twoFactorRequired: !s.twoFactorRequired }))}
                           className={`w-10 h-5 rounded-full p-1 transition-all ${settings.twoFactorRequired ? 'bg-indigo-500' : 'bg-white/10'}`}
                        >
                           <div className={`w-3 h-3 rounded-full bg-white transition-all ${settings.twoFactorRequired ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                     </div>
                     <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-tighter font-bold">Requires all workspace members to synchronize MFA artifacts.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enhanced Member Audit</span>
                        <button 
                           onClick={() => setSettings(s => ({ ...s, memberAuditEnabled: !s.memberAuditEnabled }))}
                           className={`w-10 h-5 rounded-full p-1 transition-all ${settings.memberAuditEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
                        >
                           <div className={`w-3 h-3 rounded-full bg-white transition-all ${settings.memberAuditEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                     </div>
                     <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-tighter font-bold">Synchronize member actions directly to the workspace audit ledger.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-10">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-400" /> Session Persistence
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-2 text-center">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Expiration Threshold</label>
                     <p className="text-4xl font-black text-white tracking-tighter">{settings.sessionTimeout}m</p>
                     <input 
                        type="range" 
                        min="15" max="1440" step="15"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                     />
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 space-y-6 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                     <MonitorCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-tight">Security Integrity</h4>
                     <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Inherited Policies: 12 Active</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Workspace security artifacts are synchronized with the platform's 'Zero-Trust' lattice. Some policies may be mandated by the platform and cannot be overridden.
               </p>
            </div>

            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-4">
               <div className="flex items-center gap-3 mb-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Recent Security Events</span>
               </div>
               <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                       <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Policy Commit</span>
                       <span className="text-[9px] text-indigo-400 font-bold">2H AGO</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Persistence Policy Notice */}
      <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
             <div className="p-4 rounded-3xl bg-white/[0.05] border border-white/10 text-gray-700 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <ShieldAlert className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">Security Artifact Integrity</h3>
                <p className="text-sm text-gray-500 max-w-2xl">
                   Any modification to workspace security artifacts is cryptographically sealed and logged to the global audit ledger. Platform administrators may override workspace settings during systemic security incidents.
                </p>
             </div>
          </div>
          <button className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all">Review Global Policies</button>
      </div>

    </div>
  );
}
