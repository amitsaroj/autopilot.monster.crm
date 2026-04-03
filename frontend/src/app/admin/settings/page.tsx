"use client";

import { useState, useEffect } from 'react';
import { 
  Settings, Globe, Shield, Mail, Bell, 
  Save, RefreshCw, Loader2, CheckCircle2, 
  HelpCircle, Trash2, Camera, Link as LinkIcon,
  Layout, Briefcase, Database, Cloud,
  Zap, Building2, Fingerprint, ExternalLink, Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface TenantSettings {
  name: string;
  domain?: string;
  subdomain: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  contactEmail?: string;
  address?: string;
}

export default function TenantGeneralSettingsPage() {
  const [settings, setSettings] = useState<TenantSettings>({
    name: '',
    subdomain: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/v1/settings/workspace');
        const json = await res.json();
        if (json.data) setSettings(json.data);
      } catch (e) {
        toast.error('Failed to sync workspace artifacts');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/settings/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Workspace metadata synchronized successfully');
      } else {
        toast.error('Failed to commit workspace configuration');
      }
    } catch (e) {
      toast.error('Encryption bridge failure during commit');
    } finally {
      setSaving(false);
    }
  };

  const verifyDomain = async () => {
    if (!settings.domain) return toast.error('Custom domain artifact required');
    setVerifying(true);
    try {
      const res = await fetch('/api/v1/settings/workspace/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: settings.domain }),
      });
      if (res.ok) {
        toast.success('Custom domain artifact verified');
      } else {
        toast.error('DNS record verification failure');
      }
    } catch (e) {
      toast.error('Network artifact failure during verification');
    } finally {
      setVerifying(false);
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
                 Workspace Identity active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">UID: {settings.subdomain || 'local'}.cluster</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Workspace Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Branding, Domain & Metadata</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Commit Workspace Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Main Form Area */}
         <div className="lg:col-span-2 space-y-10">
            
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Building2 className="w-6 h-6 text-indigo-500" /> Core Workspace Identity
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Workspace Display Name</label>
                     <input 
                        type="text" 
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Administrative Endpoint</label>
                     <div className="relative">
                        <input 
                           type="text" 
                           disabled
                           value={`${settings.subdomain}.autopilotmonster.crm`}
                           className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-5 py-4 text-sm text-gray-500 outline-none font-mono cursor-not-allowed"
                        />
                        <div className="absolute right-4 top-4">
                           <Lock className="w-4 h-4 opacity-20" />
                        </div>
                     </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Universal Contact Artifact</label>
                     <input 
                        type="email" 
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
               </div>
            </div>

            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                     <Globe className="w-6 h-6 text-emerald-500" /> Custom Domain Artifact
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">DNS Verified</span>
               </div>
               
               <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Authorized Domain</label>
                     <input 
                        type="text" 
                        placeholder="crm.yourbrand.com"
                        value={settings.domain}
                        onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <button 
                     type="button"
                     onClick={verifyDomain}
                     disabled={verifying}
                     className="mt-6 px-8 py-4 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                     {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Verify DNS
                  </button>
               </div>
            </div>
         </div>

         {/* Sidebar: Branding & Limits */}
         <div className="space-y-10">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Camera className="w-5 h-5 text-indigo-400" /> Visual Identity
               </h3>
               
               <div className="flex flex-col items-center gap-4 py-10 rounded-3xl bg-black/40 border border-white/5 border-dashed group cursor-pointer hover:bg-white/[0.02] transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-700 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all overflow-hidden relative">
                     {settings.branding?.logoUrl ? <img src={settings.branding.logoUrl} className="w-full h-full object-cover" /> : <Database className="w-10 h-10" />}
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">Workspace Logo</p>
                     <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase">Propagates to Dashboards</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Primary Hex</label>
                     <div className="flex items-center gap-2 p-3 bg-black/40 border border-white/5 rounded-xl">
                        <div className="w-4 h-4 rounded-md bg-indigo-500" />
                        <span className="text-[10px] font-black text-white">#6366F1</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Accent Hex</label>
                     <div className="flex items-center gap-2 p-3 bg-black/40 border border-white/5 rounded-xl">
                        <div className="w-4 h-4 rounded-md bg-emerald-500" />
                        <span className="text-[10px] font-black text-white">#10B981</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-indigo-500/10 border border-indigo-500/20 space-y-6 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 text-center">
                     <Zap className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-tight">Workspace Pulse</h4>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Enterprise Tier</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Identity changes are reflected in real-time across your workspace members' dashboards and customer-facing portals.
               </p>
               <button className="w-full py-4 bg-white text-[#0b0f19] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                  Analyze Quotas
               </button>
            </div>
         </div>
      </form>

      {/* Compliance Information */}
      <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
             <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Fingerprint className="w-10 h-10" />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Workspace Data Residency</h3>
                <p className="text-sm text-gray-500 max-w-2xl">
                   This workspace is provisioned on the 'Europe-West-Cluster'. All metadata, including custom branding artifacts, are encrypted at rest and compliant with local data protection mandates.
                </p>
             </div>
          </div>
          <button className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
             Security Manifest <ExternalLink className="w-4 h-4" />
          </button>
      </div>

    </div>
  );
}
