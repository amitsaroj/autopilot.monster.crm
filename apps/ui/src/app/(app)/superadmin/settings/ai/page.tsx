'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Save, 
  Cpu, 
  ShieldCheck,
  Brain,
  Layers,
  Activity,
  ArrowRight,
  Lock
} from 'lucide-react';
import { adminAiSettingsService } from '@/services/admin-ai-settings.service';

export default function SuperAdminAiSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminAiSettingsService.getEnv(); // Assuming getEnv for AI too
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
          <h1 className="page-title font-black text-4xl tracking-tighter text-foreground">Intelligence Manifold</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">SuperAdmin / Global Neural Engine Orchestration</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-2xl shadow-brand/30 text-[10px] uppercase tracking-widest">
            <Save className="h-4 w-4" />
            Calibrate Neural Matrix
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-card/20 backdrop-blur-xl rounded-[3.5rem] border border-border/30 p-12 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3 text-foreground">
               <Brain className="h-6 w-6 text-brand" />
               Master Neural Core
            </h2>
            <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Primary Foundation Engine</label>
                  <select className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest appearance-none text-foreground">
                     <option>OpenAI GPT-4o (Hyper-Velocity)</option>
                     <option>Anthropic Claude 3.5 Sonnet (Precision)</option>
                     <option>Llama 3 70B (Private Cluster)</option>
                     <option>Mistral Large (High-Trust Distributed)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Master API Key (Global Propagation)</label>
                  <input type="password" value="sk-proj-****************" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Organization Manifest ID</label>
                  <input type="text" value="org-938204928301" className="w-full px-6 py-4 bg-muted/20 border border-border/20 rounded-2xl outline-none focus:border-brand/40 text-[11px] font-mono font-bold text-brand" />
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-brand" />
                  Safety & PII Filtering
               </h3>
               <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter leading-relaxed mb-8">
                  Enforcing global guardrails to prevent leakage and ensure ethical alignment across all tenant layers.
               </p>
               <div className="p-5 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">PII Scrubbing: L4 Active</span>
                  <div className="w-14 h-8 bg-brand/10 rounded-full relative cursor-pointer border border-brand/20">
                     <div className="absolute right-1 top-1 w-6 h-6 bg-brand rounded-full shadow-lg" />
                  </div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-orange-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-foreground">
                  <Layers className="h-5 w-5 text-orange-500" />
                  Vector Database Vector
               </h3>
               <div className="flex items-center justify-between">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Retrieval Latency</p>
                     <p className="text-lg font-black tracking-tighter text-orange-500">14ms</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Embedding Throughput</p>
                     <p className="text-lg font-black tracking-tighter text-orange-500">4.2k/s</p>
                  </div>
                  <div className="h-10 w-px bg-border/20" />
                  <div className="text-center">
                     <p className="text-[9px] font-black text-muted-foreground/40 uppercase mb-1">Sync Integrity</p>
                     <p className="text-lg font-black tracking-tighter text-green-500">100%</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
