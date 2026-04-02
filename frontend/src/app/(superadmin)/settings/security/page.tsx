"use client";

import { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, Unlock, Eye, 
  Terminal, Database, Globe, RefreshCw, 
  Loader2, CheckCircle2, AlertCircle, 
  XCircle, ArrowRight, Activity, Server,
  Cpu, Layout, Smartphone, Fingerprint, 
  UserX, ShieldCheck, Save, Clock, History
} from 'lucide-react';
import { toast } from 'sonner';

interface SecuritySettings {
  mfaRequired: boolean;
  mfaMethods: string[];
  passwordMinLength: number;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeoutMinutes: number;
  maxFailedLogins: number;
  ipWhitelistEnabled: boolean;
  bruteForceProtection: boolean;
  passwordRotationDays: number;
}

export default function GlobalSecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    mfaRequired: false,
    mfaMethods: ['TOTP'],
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeoutMinutes: 60,
    maxFailedLogins: 5,
    ipWhitelistEnabled: false,
    bruteForceProtection: true,
    passwordRotationDays: 90,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/v1/admin/settings/security');
        const json = await res.json();
        if (json.data) setSettings(prev => ({ ...prev, ...json.data }));
      } catch (e) {
        toast.error('Failed to sync security artifacts');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Security manifest synchronized successfully');
      } else {
        toast.error('Failed to commit security configuration');
      }
    } catch (e) {
      toast.error('Encryption bridge failure during commit');
    } finally {
      setSaving(false);
    }
  };

  const toggleMFA = () => setSettings(s => ({ ...s, mfaRequired: !s.mfaRequired }));

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
                 Identity Shield active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">Node: Security-Core-Alpha</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Global Security Policies</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage MFA, Brute-Force & Identity Thresholds</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Commit Security Baseline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Identity Architecture */}
         <div className="lg:col-span-2 space-y-10">
            
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                     <Smartphone className="w-6 h-6 text-indigo-500" /> MFA Architecture
                  </h3>
                  <button 
                     onClick={toggleMFA}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${settings.mfaRequired ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/[0.05] text-gray-500 border-white/10'}`}
                  >
                     {settings.mfaRequired ? 'Mandatory Enforced' : 'Optional (Global)'}
                  </button>
               </div>
               
               <p className="text-xs text-gray-500 leading-relaxed max-w-2xl font-medium">
                  Enforce Multi-Factor Authentication across the entire platform. When active, all workspace members must authenticate via an authorized secondary verify method (TOTP, SMS, Email Artifact) before cluster access is granted.
               </p>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['TOTP', 'SMS_ARTIFACT', 'EMAIL_OTP'].map((method) => (
                    <div key={method} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:border-indigo-500/40 transition-all cursor-pointer">
                       <span className="text-[10px] font-black text-gray-400 group-hover:text-white transition-colors">{method}</span>
                       <div className="w-4 h-4 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Key className="w-6 h-6 text-emerald-500" /> Entropy & Complexity Manifest
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Minimum Length</label>
                           <span className="text-sm font-black text-white">{settings.passwordMinLength} Chars</span>
                        </div>
                        <input 
                           type="range" 
                           min="8" max="32" 
                           value={settings.passwordMinLength}
                           onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                           className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Rotation Cycle (Days)</label>
                           <span className="text-sm font-black text-white">{settings.passwordRotationDays} Days</span>
                        </div>
                        <input 
                           type="range" 
                           min="0" max="365" step="30"
                           value={settings.passwordRotationDays}
                           onChange={(e) => setSettings({ ...settings, passwordRotationDays: parseInt(e.target.value) })}
                           className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                     </div>
                  </div>
                  <div className="space-y-4">
                     {[
                       { label: 'Require Numeric Archetypes', key: 'passwordRequireNumbers' },
                       { label: 'Require Symbol Artifacts', key: 'passwordRequireSymbols' },
                       { label: 'Brute-Force Shield active', key: 'bruteForceProtection' },
                     ].map((item: any) => (
                       <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.label}</span>
                          <button 
                             onClick={() => setSettings({ ...settings, [item.key]: !(settings as any)[item.key] })}
                             className={`w-10 h-5 rounded-full p-1 transition-all ${ (settings as any)[item.key] ? 'bg-indigo-500' : 'bg-white/10' }`}
                          >
                             <div className={`w-3 h-3 rounded-full bg-white transition-all ${ (settings as any)[item.key] ? 'translate-x-5' : 'translate-x-0' }`} />
                          </button>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Side: Session & Thresholds */}
         <div className="space-y-10">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-400" /> Session Persistence
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 text-center block">TTL (Minutes)</label>
                     <p className="text-4xl font-black text-white text-center tracking-tighter">{settings.sessionTimeoutMinutes}</p>
                     <input 
                        type="range" 
                        min="15" max="1440" step="15"
                        value={settings.sessionTimeoutMinutes}
                        onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                     />
                  </div>
                  <p className="text-[10px] text-gray-600 font-medium text-center leading-relaxed">
                     Inactive cluster sessions will be pruned and cryptographically invalidated after this threshold.
                  </p>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <UserX className="w-5 h-5 text-red-400" /> Violation Thresholds
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 text-center block">Lockout After (Retries)</label>
                     <p className="text-4xl font-black text-white text-center tracking-tighter">{settings.maxFailedLogins}</p>
                     <input 
                        type="range" 
                        min="3" max="20"
                        value={settings.maxFailedLogins}
                        onChange={(e) => setSettings({ ...settings, maxFailedLogins: parseInt(e.target.value) })}
                        className="w-full accent-red-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                     />
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-red-500/10 border border-red-500/20 space-y-6 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-red-500 text-white shadow-xl shadow-red-500/20">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-tight">Critical Isolation</h4>
                     <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Global IP Whitelist: OFF</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Modifying platform identity shields will trigger a global cache invalidation and force a re-handshake for all active clusters.
               </p>
            </div>
         </div>
      </div>

      {/* Security Advisory Ledger */}
      <div className="p-10 rounded-[40px] border border-dashed border-white/10 bg-white/[0.01] flex items-center gap-8 group">
         <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <History className="w-10 h-10" />
         </div>
         <div className="space-y-1 flex-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Security Policy Persistence</h3>
            <p className="text-sm text-gray-500 max-w-4xl">
               Platform-wide security artifacts are cryptographically hashed and logged to the systemic audit trail. All modifications require 'Platform Controller' role authentication and generate an emergency artifact dispatch to the cluster administrators.
            </p>
         </div>
         <button className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all">Security Audit</button>
      </div>

    </div>
  );
}
