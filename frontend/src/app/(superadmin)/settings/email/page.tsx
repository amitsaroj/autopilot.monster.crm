"use client";

import { useState, useEffect } from 'react';
import { 
  Mail, Send, ShieldCheck, Database, 
  Server, Globe, RefreshCw, Loader2, 
  CheckCircle2, AlertCircle, XCircle, 
  ArrowRight, Activity, Cpu, Layout, 
  Lock, Save, Terminal, History, Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  tlsEnabled: boolean;
  provider: 'SMTP' | 'SES' | 'SENDGRID' | 'POSTMARK';
}

export default function GlobalEmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.autopilotmonster.com',
    smtpPort: 587,
    smtpUser: 'notifications@autopilotmonster.com',
    smtpPass: '••••••••••••••••',
    fromEmail: 'noreply@autopilotmonster.com',
    fromName: 'Autopilot Monster',
    tlsEnabled: true,
    provider: 'SMTP',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/v1/admin/settings/email');
        const json = await res.json();
        if (json.data) setSettings(prev => ({ ...prev, ...json.data }));
      } catch (e) {
        toast.error('Failed to sync communication artifacts');
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
      const res = await fetch('/api/v1/admin/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Communication manifest committed successfully');
      } else {
        toast.error('Failed to commit SMTP configuration');
      }
    } catch (e) {
      toast.error('Network artifact failure during commit');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return toast.error('Verification target email required');
    setTesting(true);
    try {
      const res = await fetch('/api/v1/admin/settings/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      if (res.ok) {
        toast.success('Test artifact dispatched successfully');
      } else {
        toast.error('SMTP Authentication failure during dispatch');
      }
    } catch (e) {
      toast.error('Communication bridge failure during test');
    } finally {
      setTesting(false);
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
                 Outbound Persistence active
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">Server: Mail-Relay-X1</span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Communication Orchestrator</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Global SMTP & Message Dispatch Infrastructure</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
        >
           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
           Commit Dispatch Baseline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Main SMTP Form */}
         <div className="lg:col-span-2 space-y-10">
            
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Server className="w-6 h-6 text-indigo-500" /> Dispatch Infrastructure
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">SMTP Gateway Host</label>
                     <input 
                        type="text" 
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Gateway Port</label>
                     <input 
                        type="number" 
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Authentication Identity</label>
                     <input 
                        type="text" 
                        value={settings.smtpUser}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-2 relative">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Authentication Secret</label>
                     <input 
                        type="password" 
                        value={settings.smtpPass}
                        onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                     <div className="absolute right-4 top-10 flex gap-2">
                        <Lock className="w-4 h-4 text-gray-600" />
                     </div>
                  </div>
               </div>
               
               <div className="p-6 rounded-3xl bg-indigo-500/[0.02] border border-indigo-500/10 flex items-center justify-between">
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-white uppercase tracking-widest">TLS Encryption Bridge</h4>
                     <p className="text-[10px] text-gray-600 font-medium">Verify connection integrity via STARTTLS protocol before artifact dispatch.</p>
                  </div>
                  <button 
                     onClick={() => setSettings({ ...settings, tlsEnabled: !settings.tlsEnabled })}
                     className={`w-12 h-6 rounded-full p-1 transition-all ${settings.tlsEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white transition-all ${settings.tlsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>
            </div>

            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-10 group">
               <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                  <Mail className="w-6 h-6 text-emerald-500" /> Dispatch Identity
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Universal From Email</label>
                     <input 
                        type="email" 
                        value={settings.fromEmail}
                        onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Universal Sender Name</label>
                     <input 
                        type="text" 
                        value={settings.fromName}
                        onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 focus:bg-white/[0.05] transition-all font-medium"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Side: Verification & Compliance */}
         <div className="space-y-10">
            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-indigo-400" /> Verification Tunnel
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 block text-center">Re-Verification Target</label>
                     <input 
                        type="email" 
                        placeholder="test@autopilotmonster.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all font-medium text-center"
                     />
                  </div>
                  <button 
                     onClick={handleTestEmail}
                     disabled={testing}
                     className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                  >
                     {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                     Dispatch Verification Artifact
                  </button>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
               <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Globe className="w-5 h-5 text-emerald-400" /> Verified Providers
               </h3>
               
               <div className="space-y-3">
                  {[
                    { id: 'SMTP', label: 'Authorized Relay', active: settings.provider === 'SMTP' },
                    { id: 'SES', label: 'AWS Cloud Engine', active: settings.provider === 'SES' },
                    { id: 'SENDGRID', label: 'SendGrid Grid', active: settings.provider === 'SENDGRID' },
                  ].map((p) => (
                    <div 
                       key={p.id}
                       onClick={() => setSettings({ ...settings, provider: p.id as any })}
                       className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${p.active ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
                    >
                       <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${p.active ? 'text-white' : 'text-gray-500'}`}>{p.id}</p>
                          <p className="text-[9px] text-gray-600 font-mono italic">{p.label}</p>
                       </div>
                       {p.active && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />}
                    </div>
                  ))}
                  <button className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[9px] font-black text-gray-600 uppercase tracking-widest hover:border-white/20 transition-all flex items-center justify-center gap-2">
                     <Plus className="w-3 h-3" /> Connect Cloud Engine
                  </button>
               </div>
            </div>

            <div className="p-8 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 space-y-4 group">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-tight">SMTP Integrity</h4>
                     <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Connection: Certified</p>
                  </div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Dispatch infrastructure is verified for DMARC, SPF, and DKIM compliance artifacts. All system-generated communication is cryptographically signed.
               </p>
            </div>
         </div>
      </div>

      {/* Compliance Advisory Ledger */}
      <div className="p-10 rounded-[40px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-8 group">
         <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/10 text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <History className="w-10 h-10" />
         </div>
         <div className="space-y-1 flex-1">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Communication Persistence Policy</h3>
            <p className="text-sm text-gray-500 max-w-4xl">
               Platform SMTP artifacts are synchronized hourly with the communication cluster. Administrative efforts to modify or bypass dispatch protocols generate an emergency 'security.audit' artifact for platform forensic review.
            </p>
         </div>
      </div>

    </div>
  );
}
