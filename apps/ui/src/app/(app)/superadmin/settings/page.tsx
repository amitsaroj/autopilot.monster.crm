'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Loader2, 
  ShieldAlert, 
  Mail, 
  Globe, 
  Bell, 
  Database,
  Zap,
  CheckCircle2,
  Lock,
  RefreshCcw,
  Cloud
} from 'lucide-react';
import { adminSettingsService, PlatformSetting } from '@/services/admin-settings.service';
import toast from 'react-hot-toast';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminSettingsService.findAll();
      setSettings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any, group: string) => {
    try {
      setSaving(key);
      await adminSettingsService.update(key, value, group);
      toast.success(`${key} updated`);
      loadSettings();
    } catch (err) {
      toast.error('Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  const getVal = (key: string) => settings.find(s => s.key === key)?.value || '';

  if (loading) return <div className="p-8 animate-pulse text-muted-foreground font-black text-xs uppercase tracking-widest">Encrypting Control Plane...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Global Protocol Settings</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Platform Orchestration / Core Constants</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl flex items-center gap-3">
              <Lock className="h-4 w-4 text-brand" />
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">Master Key Access</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Identity */}
        <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl border-l-4 border-l-brand">
           <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
              <Globe className="h-5 w-5 text-brand" />
              Platform Identity
           </h2>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SaaS Product Name</label>
                 <div className="flex gap-2">
                    <input 
                      className="flex-1 px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                      defaultValue={getVal('PLATFORM_NAME') || 'Autopilot Monster'}
                      onBlur={(e) => updateSetting('PLATFORM_NAME', e.target.value, 'GENERAL')}
                    />
                    {saving === 'PLATFORM_NAME' && <Loader2 className="h-4 w-4 animate-spin text-brand mt-4" />}
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System Support Email</label>
                 <div className="flex gap-2">
                    <input 
                      className="flex-1 px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                      defaultValue={getVal('SUPPORT_EMAIL') || 'support@monster.fm'}
                      onBlur={(e) => updateSetting('SUPPORT_EMAIL', e.target.value, 'GENERAL')}
                    />
                    {saving === 'SUPPORT_EMAIL' && <Loader2 className="h-4 w-4 animate-spin text-brand mt-4" />}
                 </div>
              </div>
           </div>
        </div>

        {/* Maintenance Mode */}
        <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
           <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Maintenance Protocols
              </span>
              <div className="flex items-center gap-2">
                 <p className="text-[9px] font-black text-muted-foreground/60 uppercase">Status:</p>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${getVal('MAINTENANCE_MODE') === 'true' ? 'text-red-500' : 'text-green-500'}`}>
                    {getVal('MAINTENANCE_MODE') === 'true' ? 'Active' : 'Offline'}
                 </span>
              </div>
           </h2>
           <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-muted/10">
                 <div>
                    <p className="text-xs font-black uppercase tracking-tight">Active Maintenance Lockdown</p>
                    <p className="text-[9px] text-muted-foreground mt-1">Disconnects all tenants except SuperAdmins</p>
                 </div>
                 <button 
                  onClick={() => updateSetting('MAINTENANCE_MODE', getVal('MAINTENANCE_MODE') === 'true' ? 'false' : 'true', 'SYSTEM')}
                  className={`w-12 h-6 rounded-full transition-all relative ${getVal('MAINTENANCE_MODE') === 'true' ? 'bg-red-500' : 'bg-muted/40'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${getVal('MAINTENANCE_MODE') === 'true' ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Intercept Message</label>
                 <textarea 
                   className="w-full px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-xs focus:border-brand/40 outline-none transition-all h-24"
                   defaultValue={getVal('MAINTENANCE_MESSAGE') || 'System update in progress. Please check back later.'}
                   onBlur={(e) => updateSetting('MAINTENANCE_MESSAGE', e.target.value, 'SYSTEM')}
                 />
              </div>
           </div>
        </div>

        {/* Branding Global */}
        <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl">
           <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3">
              <Zap className="h-5 w-5 text-brand" />
              Global Visual Specs
           </h2>
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Platform Color (Hex)</label>
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl border border-border/50" style={{ backgroundColor: getVal('GLOBAL_PRIMARY_COLOR') || '#4f46e5' }} />
                    <input 
                      className="flex-1 px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                      defaultValue={getVal('GLOBAL_PRIMARY_COLOR') || '#4f46e5'}
                      onBlur={(e) => updateSetting('GLOBAL_PRIMARY_COLOR', e.target.value, 'BRANDING')}
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System Favicon URL</label>
                 <input 
                   className="w-full px-4 py-3 bg-muted/20 border border-border/30 rounded-xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                   defaultValue={getVal('GLOBAL_FAVICON') || ''}
                   onBlur={(e) => updateSetting('GLOBAL_FAVICON', e.target.value, 'BRANDING')}
                 />
              </div>
           </div>
        </div>

        {/* Database & Backups */}
        <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl border-l-4 border-l-emerald-500">
           <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center justify-between">
              <span className="flex items-center gap-3">
                <Database className="h-5 w-5 text-emerald-500" />
                Preservation & Redundancy
              </span>
              <button className="text-[9px] font-black text-brand uppercase tracking-widest flex items-center gap-1 hover:underline">
                 <RefreshCcw className="h-3 w-3" />
                 Initialize Backup
              </button>
           </h2>
           <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-bold">
                 <span className="text-muted-foreground/60 flex items-center gap-2">
                    <Cloud className="h-3 w-3 text-emerald-500" />
                    Automated Backups
                 </span>
                 <span className="text-emerald-500 uppercase tracking-widest text-[10px] font-black">Daily @ 03:00 UTC</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                 <p className="text-[10px] font-black uppercase text-emerald-500/70 mb-1">State Retention Policy</p>
                 <p className="text-[9px] font-medium leading-relaxed uppercase tracking-widest">
                    Last successful sync: <span className="text-emerald-500">2 Hours Ago</span>. 
                    Redundant copies distributed to 3 regions.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
