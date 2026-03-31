'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Save, 
  RefreshCw, 
  ShieldCheck,
  Send,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { adminEmailSettingsService } from '@/services/admin-email-settings.service';

export default function SuperAdminEmailSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminEmailSettingsService.getSettings();
      setSettings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-8">
        <div>
          <h1 className="page-title font-black text-4xl tracking-tighter text-foreground">Email Transmission</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Global SMTP & Delivery Orchestration</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-2xl shadow-brand/30 text-[10px] uppercase tracking-widest">
            <Save className="h-4 w-4" />
            Apply Protocols
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-card/20 backdrop-blur-xl rounded-[3.5rem] border border-border/30 p-12 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
               <Zap className="h-5 w-5 text-brand" />
               Primary Relay Vector
            </h2>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Relay Provider</label>
                  <select className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest appearance-none">
                     <option>Amazon SES (Synchronized)</option>
                     <option>SendGrid / Twilio Manifest</option>
                     <option>Mailgun / Rackspace Node</option>
                     <option>Postmark / High-Trust Vector</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Access Key ID</label>
                  <input type="password" value="AKIA****************" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Secret Access Token</label>
                  <input type="password" value="********************************" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  DKIM / SPF Validation
               </h3>
               <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter leading-relaxed mb-8">
                  Ensuring 99.9% inbox penetration via platform-wide cryptographic identity orchestration.
               </p>
               <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Global DKIM: 2048-bit</span>
                  <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black tracking-widest">VALIDATED</div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-purple-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Send className="h-5 w-5 text-purple-500" />
                  Latency Matrix
               </h3>
               <div className="flex items-center justify-between">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">P95 Delivery</p>
                     <p className="text-lg font-black tracking-tighter text-purple-500">2.4s</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Queue Velocity</p>
                     <p className="text-lg font-black tracking-tighter text-purple-500">1.2k/min</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Drop Rate</p>
                     <p className="text-lg font-black tracking-tighter text-green-500">0.05%</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
