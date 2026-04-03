"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Settings, Trash2, Globe, ShieldCheck, 
  RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, XCircle, ArrowRight, Activity, 
  Server, Cpu, Layout, ExternalLink, Package,
  Zap, Download, Star, Users, Link as LinkIcon,
  Shield, Lock, Key, Fingerprint, Eye,
  Smartphone, Monitor, ShieldAlert, Wifi,
  Save, History, Bell, UserCheck, ShieldOff
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkspaceSecuritySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    mfaEnforced: false,
    sessionTimeout: 1440,
    ipWhitelist: '',
    passwordRotation: 90,
    notificationOnLogin: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Persistence via generic settings endpoint
      await fetch('/api/v1/settings/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'security_policy', value: settings, group: 'SECURITY' })
      });
      toast.success('Security artifacts synchronized successfully');
    } catch (e) {
      toast.error('Failed to update security persistence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                 Shield Protocol Active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Node: Security-Orchestrator</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">Workspace Protection</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Authentication Lattices, Session Forensics & IP Persistence</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={loading}
           className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group"
        >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
           Synchronize Policies
        </button>
      </div>

      {/* Security Status Forensics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-8 group relative overflow-hidden">
            <div className="p-5 rounded-3xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter">Lattice Integrity</h3>
               <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mt-1">Status: Optimized Protocol</p>
            </div>
         </div>
         <div className="p-8 rounded-[40px] bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-8 group relative overflow-hidden">
            <div className="p-5 rounded-3xl bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20">
               <Fingerprint className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter">Auth Forensics</h3>
               <p className="text-[10px] text-indigo-500/60 font-black uppercase tracking-widest mt-1">Audit: 0 Divergences</p>
            </div>
         </div>
         <div className="p-8 rounded-[40px] bg-red-500/5 border border-red-500/20 flex items-center gap-8 group relative overflow-hidden">
            <div className="p-5 rounded-3xl bg-red-500 text-white shadow-2xl shadow-red-500/20">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter">Threat Radar</h3>
               <p className="text-[10px] text-red-500/60 font-black uppercase tracking-widest mt-1">Active: Global Monitoring</p>
            </div>
         </div>
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
         
         {/* Authentication Lattices */}
         <div className="p-10 rounded-[60px] bg-white/[0.01] border border-white/[0.05] space-y-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Key className="w-10 h-10" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-sans leading-none">Authentication Core</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">Manage Identity Verification Protocol</p>
               </div>
            </div>

            <div className="space-y-8">
               <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter">Require MFA dispatch</h4>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Force Multi-Factor Interaction for all administrative nodes</p>
                  </div>
                  <div 
                     onClick={() => setSettings({...settings, mfaEnforced: !settings.mfaEnforced})}
                     className={`w-14 h-8 rounded-full transition-all relative p-1 ${settings.mfaEnforced ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/10'}`}
                  >
                     <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.mfaEnforced ? 'ml-6 shadow-xl' : 'ml-0'}`} />
                  </div>
               </div>

               <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-sm font-black text-white uppercase tracking-tighter">Session Persistence Lattice</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Automatic logout after inactive window forensics (Minutes)</p>
                  <input 
                     type="number" 
                     value={settings.sessionTimeout}
                     onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                     className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-indigo-500/30 transition-all"
                  />
               </div>

               <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer">
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter">Dispatch Login Alerts</h4>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Notify account holder on every successful session initialization</p>
                  </div>
                  <div 
                     onClick={() => setSettings({...settings, notificationOnLogin: !settings.notificationOnLogin})}
                     className={`w-14 h-8 rounded-full transition-all relative p-1 ${settings.notificationOnLogin ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/10'}`}
                  >
                     <div className={`w-6 h-6 bg-white rounded-full transition-all ${settings.notificationOnLogin ? 'ml-6 shadow-xl' : 'ml-0'}`} />
                  </div>
               </div>
            </div>
         </div>

         {/* Advanced Lattices */}
         <div className="p-10 rounded-[60px] bg-[#0b0f19] border border-white/[0.05] space-y-10 group relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="flex items-center gap-6">
               <div className="p-5 rounded-3xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <Wifi className="w-10 h-10" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-sans leading-none">Access Topology</h3>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-2">Manage Network Persistence Patterns</p>
               </div>
            </div>

            <div className="space-y-8">
               <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.01] border border-white/5">
                  <h4 className="text-sm font-black text-white uppercase tracking-tighter">IP Lattice Whitelist</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Restrict administrative dispatches to authorized IP nodes (Comma-separated)</p>
                  <textarea 
                     placeholder="e.g. 192.168.1.1, 10.0.0.1"
                     value={settings.ipWhitelist}
                     onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
                     className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-white font-mono text-sm outline-none focus:border-red-500/30 transition-all min-h-[120px] resize-none"
                  />
               </div>

               <div className="p-8 rounded-3xl bg-indigo-500 to-purple-800 text-white space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                  <div className="flex items-center gap-4">
                     <ShieldCheck className="w-8 h-8" />
                     <h4 className="text-lg font-black uppercase tracking-tighter leading-none">Structural Audit Log</h4>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed font-bold uppercase tracking-tight">
                     Access comprehensive workspace audit forensics. Track every policy-divergence and administrative dispatch within your secure lattice.
                  </p>
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
                     Inspect Audit Forensics
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Danger Zone artifact */}
      <div className="p-10 rounded-[60px] bg-red-500/5 border border-dashed border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-10 group mt-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                <ShieldOff className="w-10 h-10" />
             </div>
             <div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-1">Structural Decommission</h4>
                <p className="text-sm text-gray-600 max-w-xl font-medium tracking-tight uppercase px-1">Initialize workspace termination protocol. This action is cryptographically irreversible and will purge all persistence artifacts.</p>
             </div>
          </div>
          <button className="px-10 py-5 bg-red-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-500/20 shrink-0">
             Execute Termination
          </button>
      </div>

    </div>
  );
}
