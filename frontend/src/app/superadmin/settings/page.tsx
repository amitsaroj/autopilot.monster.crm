"use client";

import { useState, useEffect } from 'react';
import { 
  Settings, Globe, Shield, Mail, Bell, 
  Save, RefreshCw, Loader2, CheckCircle2, 
  HelpCircle, Trash2, Camera, Link as LinkIcon,
  Layout, Briefcase, Database, Cloud
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformSettings {
  appName: string;
  appDescription: string;
  supportEmail: string;
  contactEmail: string;
  websiteUrl: string;
  termsUrl: string;
  privacyUrl: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export default function GlobalGeneralSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    appName: 'Autopilot Monster CRM',
    appDescription: 'Advanced SaaS AI-powered CRM Orchestrator',
    supportEmail: 'support@autopilotmonster.com',
    contactEmail: 'contact@autopilotmonster.com',
    websiteUrl: 'https://autopilotmonster.com',
    termsUrl: 'https://autopilotmonster.com/terms',
    privacyUrl: 'https://autopilotmonster.com/privacy',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/v1/admin/settings/system');
        const json = await res.json();
        if (json.data) setSettings(prev => ({ ...prev, ...json.data }));
      } catch (e) {
        toast.error('Failed to sync platform configuration');
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
      const res = await fetch('/api/v1/admin/settings/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Platform metadata synchronized successfully');
      } else {
        toast.error('Failed to commit systemic configuration');
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
                 Platform Identity active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">Node: Infrastructure-Master</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Systemic Configuration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Global Metadata & Platform Identity</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Commit Platform Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Main Identity Form */}
         <div className="lg:col-span-2 space-y-8">
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Briefcase className="w-6 h-6 text-indigo-500" /> Core Brand Identity
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Platform Name</label>
                     <input 
                        type="text" 
                        value={settings.appName}
                        onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Support Email Artifact</label>
                     <input 
                        type="email" 
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Platform Description</label>
                     <textarea 
                        rows={3}
                        value={settings.appDescription}
                        onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium resize-none"
                     />
                  </div>
               </div>
            </div>

            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <LinkIcon className="w-6 h-6 text-emerald-500" /> Platform Persistence Links
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Public Website URL', key: 'websiteUrl' },
                    { label: 'Terms of Service Artifact', key: 'termsUrl' },
                    { label: 'Privacy Protocol Artifact', key: 'privacyUrl' },
                    { label: 'Administrative Contact', key: 'contactEmail' },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                       <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">{field.label}</label>
                       <input 
                          type="text" 
                          value={(settings as any)[field.key]}
                          onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all font-medium"
                       />
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar: Assets & Quick Settings */}
         <div className="space-y-8">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Camera className="w-5 h-5 text-indigo-400" /> Visual Manifest
               </h3>
               
               <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 py-8 rounded-3xl bg-black/40 border border-white/5 border-dashed group cursor-pointer hover:bg-white/[0.02] transition-all">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <Database className="w-8 h-8" />
                     </div>
                     <div className="text-center">
                        <p className="text-xs font-black text-white uppercase tracking-widest">Platform Logo</p>
                        <p className="text-[10px] text-gray-600 font-mono mt-1 uppercase">SVG, PNG (Max 2MB)</p>
                     </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 py-8 rounded-3xl bg-black/40 border border-white/5 border-dashed group cursor-pointer hover:bg-white/[0.02] transition-all">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Layout className="w-8 h-8" />
                     </div>
                     <div className="text-center">
                        <p className="text-xs font-black text-white uppercase tracking-widest">Platform Favicon</p>
                        <p className="text-[10px] text-gray-600 font-mono mt-1 uppercase">ICO, PNG (32x32)</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-indigo-500/10 border border-indigo-500/20 space-y-6 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                     <Cloud className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-tight">Systemic Integrity</h4>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Master Node: Ready</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Modifying platform-wide metadata will propagate across all user interfaces and transactional messaging templates within 12 seconds.
               </p>
               <button className="w-full py-4 bg-white text-[#0b0f19] rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                  Analyze Propagation
               </button>
            </div>
         </div>
      </form>

      {/* Persistence Policy Notice */}
      <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-between gap-8 group">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
               <HelpCircle className="w-8 h-8 text-gray-700" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white mb-1">Advanced Orchestration Required?</h3>
               <p className="text-sm text-gray-500 max-w-xl">
                  Fine-grained system settings including DNS mapping, SMTP integration, and MFA policies are managed in specialized orchestration sections.
               </p>
            </div>
         </div>
         <button className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all">Read Manifest</button>
      </div>

    </div>
  );
}
