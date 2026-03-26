'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  MessageCircle, 
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { adminWhatsappSettingsService } from '@/services/admin-whatsapp-settings.service';

export default function SuperAdminWhatsappSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminWhatsappSettingsService.findAll();
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
          <h1 className="page-title font-black text-4xl tracking-tighter text-foreground">Meta Orchestration</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Global WhatsApp Business (WABA) Control</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-[#25D366] text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-2xl shadow-[#25D366]/30 text-[10px] uppercase tracking-widest">
            <Save className="h-4 w-4" />
            Apply Protocols
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-card/20 backdrop-blur-xl rounded-[3.5rem] border border-border/30 p-12 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3 text-foreground">
               <MessageCircle className="h-6 w-6 text-[#25D366]" />
               Cloud API Vector
            </h2>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Meta Business ID</label>
                  <input type="text" value="384920493820123" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-[#25D366]/40 text-[11px] font-mono font-bold text-[#25D366]" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">WhatsApp Business Account ID</label>
                  <input type="text" value="948203948201" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-[#25D366]/40 text-[11px] font-mono font-bold text-[#25D366]" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Permanent System User Token</label>
                  <input type="password" value="EAAG********************************" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-[#25D366]/40 text-[11px] font-mono font-bold text-[#25D366]" />
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-[#25D366]">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-[#25D366]" />
                  Meta Webhook Security
               </h3>
               <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter leading-relaxed mb-8">
                  Ensuring secure encrypted payload synchronization from Meta Graph Nodes.
               </p>
               <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Verification Node</span>
                  <div className="px-3 py-1 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-full text-[8px] font-black tracking-widest">SYNCHRONIZED</div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-blue-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  Conversation Matrix
               </h3>
               <div className="flex items-center justify-between">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Mkt Conversations</p>
                     <p className="text-lg font-black tracking-tighter text-[#25D366]">14.2k</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Svc Conversations</p>
                     <p className="text-lg font-black tracking-tighter text-[#25D366]">42.1k</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Auth Conversations</p>
                     <p className="text-lg font-black tracking-tighter text-[#25D366]">1.4k</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
