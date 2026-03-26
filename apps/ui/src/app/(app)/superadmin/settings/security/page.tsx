'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Save, 
  Lock, 
  Key,
  ShieldAlert,
  UserCheck,
  Zap,
  Fingerprint,
  RefreshCw,
  Eye
} from 'lucide-react';
import { adminSecuritySettingsService } from '@/services/admin-security-settings.service';

export default function SuperAdminSecuritySettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminSecuritySettingsService.findAll();
      setSettings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-foreground">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-8">
        <div>
          <h1 className="page-title font-black text-4xl tracking-tighter">Security Perimeter</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Global Hardening & Auth Orchestration</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-2xl shadow-brand/30 text-[10px] uppercase tracking-widest">
            <Lock className="h-4 w-4" />
            Commit Protocols
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-card/20 backdrop-blur-xl rounded-[3.5rem] border border-border/30 p-12 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
               <Key className="h-6 w-6 text-brand" />
               Master Authentication Core
            </h2>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Global Session Entropy</label>
                  <select className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest appearance-none text-foreground">
                     <option>JWT / RS256 (High Integrity)</option>
                     <option>Opaque / Redis Cluster (Stateful)</option>
                     <option>Mutual TLS (L7 Zero-Trust)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Global Session Timeout (Seconds)</label>
                  <input type="number" defaultValue={86400} className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
               <div className="flex items-center justify-between p-6 bg-muted/10 rounded-2xl border border-border/10">
                  <div className="space-y-1">
                     <span className="text-[10px] font-black uppercase tracking-widest">Enforce MFA Globally</span>
                     <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">Mandatory 2FA for all administrative personnel.</p>
                  </div>
                  <div className="w-12 h-6 bg-brand rounded-full relative cursor-pointer border border-brand/20">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-brand" />
                  L7 DDoS Hardening
               </h3>
               <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter leading-relaxed mb-8">
                  Intelligent rate-limiting and IP reputation scoring across all ingress nodes.
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/10 border border-border/10 text-center">
                     <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Global Burst Limit</p>
                     <p className="text-sm font-black text-brand tracking-tighter">5,000 req/s</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/10 border border-border/10 text-center">
                     <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">IP Reputation Floor</p>
                     <p className="text-sm font-black text-brand tracking-tighter">75/100</p>
                  </div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-emerald-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Fingerprint className="h-5 w-5 text-emerald-500" />
                  Audit Integrity
               </h3>
               <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/10 border border-border/10">
                  <span className="text-[10px] font-black uppercase tracking-widest">Log Immutability Node</span>
                  <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black tracking-widest">ACTIVE</div>
               </div>
               <button className="w-full mt-6 py-3 bg-muted/20 border border-border/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-brand hover:border-brand/20 transition-all flex items-center justify-center gap-2">
                  <Eye className="h-3 w-3" />
                  Inspect Encryption Manifest
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
