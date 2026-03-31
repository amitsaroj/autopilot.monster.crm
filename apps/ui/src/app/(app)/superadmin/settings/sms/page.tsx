'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Save, 
  Plus, 
  Smartphone,
  Zap,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { adminSmsSettingsService } from '@/services/admin-sms-settings.service';

export default function SuperAdminSmsSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminSmsSettingsService.findAll();
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
          <h1 className="page-title font-black text-4xl tracking-tighter text-foreground">Cellular Transmission</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Global SMS & A2P Orchestration</p>
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
               CPaaS Relay Core
            </h2>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Vector</label>
                  <select className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest appearance-none text-foreground">
                     <option>Twilio / Global Manifest</option>
                     <option>MessageBird / European Node</option>
                     <option>Vonage / Nexmo Vector</option>
                     <option>Plivo / High-Volume Cluster</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Account SID / Project ID</label>
                  <input type="password" value="AC****************" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Authenticity Token</label>
                  <input type="password" value="********************************" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  A2P 10DLC Compliance
               </h3>
               <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter leading-relaxed mb-8">
                  Ensuring compliance with global carrier regulations and high-magnitude message delivery.
               </p>
               <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Carrier Status</span>
                  <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black tracking-widest">REGISTERED</div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-emerald-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <Smartphone className="h-5 w-5 text-emerald-500" />
                  Active Numbers Pool
               </h3>
               <div className="flex items-center justify-between">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Global Pool</p>
                     <p className="text-lg font-black tracking-tighter text-emerald-500">482</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Sms Latency</p>
                     <p className="text-lg font-black tracking-tighter text-emerald-500">1.8s</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Throughput</p>
                     <p className="text-lg font-black tracking-tighter text-green-500">100/s</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
