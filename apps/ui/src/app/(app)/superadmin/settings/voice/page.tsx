'use client';

import { useState, useEffect } from 'react';
import { 
  Phone, 
  Save, 
  Plus, 
  Smartphone,
  Zap,
  Lock,
  ArrowRight,
  ShieldCheck,
  Server,
  Activity
} from 'lucide-react';
import { adminVoiceSettingsService } from '@/services/admin-voice-settings.service';

export default function SuperAdminVoiceSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminVoiceSettingsService.findAll();
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
          <h1 className="page-title font-black text-4xl tracking-tighter text-foreground">Telephony Manifold</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Global SIP & Audio Routing Orchestration</p>
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
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3 text-foreground">
               <Zap className="h-5 w-5 text-brand" />
               SIP Trunking Core
            </h2>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Carrier</label>
                  <select className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest appearance-none text-foreground">
                     <option>Twilio Elastic SIP Trunking</option>
                     <option>Telnyx Global Mesh</option>
                     <option>Bandwidth / Direct Ingress</option>
                     <option>Plivo / Standard Relay</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Trunk ID</label>
                     <input type="text" value="TK938204928" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Termination URI</label>
                     <input type="text" value="gw.autopilot.sip" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  Audio Encryption (SRTP)
               </h3>
               <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter leading-relaxed mb-8">
                  Ensuring AES-256 encrypted audio pathways for all platform voice traffic.
               </p>
               <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">TLS Handshake: L7 Active</span>
                  <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black tracking-widest">SECURED</div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-blue-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Global Audio Metrics
               </h3>
               <div className="flex items-center justify-between">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Mean Jitter</p>
                     <p className="text-lg font-black tracking-tighter text-blue-500">8ms</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Packet Loss</p>
                     <p className="text-lg font-black tracking-tighter text-blue-500">0.01%</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">MOS Score</p>
                     <p className="text-lg font-black tracking-tighter text-green-500">4.8/5</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
