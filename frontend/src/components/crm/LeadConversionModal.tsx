"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Loader2, 
  Rocket, 
  Shield, 
  Building2, 
  User, 
  PlusCircle, 
  Zap, 
  ChevronRight, 
  Database, 
  GitMerge, 
  CheckCircle2, 
  Star 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api/client";

export default function LeadConversionModal({ isOpen, onClose, lead, onSuccess }: { isOpen: boolean; onClose: () => void; lead: any; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    createCompany: true,
    createDeal: true,
    dealName: "",
    pipelineId: "",
  });

  const fetchPipelines = async () => {
    try {
      const res = await api.get("/crm/pipelines");
      const list = res.data?.data || [];
      setPipelines(list);
      if (list.length > 0) setFormData(f => ({ ...f, pipelineId: list[0].id }));
    } catch (e) {}
  };

  useEffect(() => {
     if (isOpen) {
        fetchPipelines();
        setFormData(f => ({ ...f, dealName: `${lead?.firstName}'s Strategic Acquisition` }));
     }
  }, [isOpen]);

  const handleConvert = async () => {
    setLoading(true);
    try {
      await api.post(`/crm/leads/${lead.id}/convert`, formData);
      toast.success("Engagement materialized as CRM vector");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Acquisition conversion failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-2xl p-12 rounded-[50px] bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute -left-24 -top-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 space-y-10">
           <div className="flex justify-between items-center mb-8">
              <div className="w-20 h-20 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40">
                 <Rocket className="w-10 h-10" />
              </div>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    Lead-to-Contact Flow Active
                 </span>
              </div>
           </div>

           <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 leading-none italic">Acquisition Conversion</h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Transition high-velocity lead vector into the core CRM relational lattice.</p>
           </div>

           <div className="space-y-6">
              <div className={cn(
                "p-8 rounded-[40px] border transition-all cursor-pointer group",
                formData.createCompany ? "bg-indigo-500/5 border-indigo-500/40 shadow-inner" : "bg-white/[0.02] border-white/5 opacity-50"
              )} onClick={() => setFormData({...formData, createCompany: !formData.createCompany})}>
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-indigo-400">
                       <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-black text-white uppercase tracking-widest">Provision Organization Entity</h4>
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">Extract company intelligence from lead metadata and materialize.</p>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 transition-all", formData.createCompany ? "bg-indigo-500 border-indigo-400 shadow-lg" : "border-white/10")} />
                 </div>
              </div>

              <div className={cn(
                "p-8 rounded-[40px] border transition-all cursor-pointer group",
                formData.createDeal ? "bg-emerald-500/5 border-emerald-500/40 shadow-inner" : "bg-white/[0.02] border-white/5 opacity-50"
              )} onClick={() => setFormData({...formData, createDeal: !formData.createDeal})}>
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-emerald-400">
                       <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-black text-white uppercase tracking-widest">Initialize Strategic Deal Vector</h4>
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">Open a new revenue opportunity and inject into the pipeline matrix.</p>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 transition-all", formData.createDeal ? "bg-emerald-500 border-emerald-400 shadow-lg" : "border-white/10")} />
                 </div>
              </div>

              {formData.createDeal && (
                 <div className="space-y-4 pt-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 italic">Designation (Deal Name)</label>
                          <input type="text" value={formData.dealName} onChange={(e) => setFormData({...formData, dealName: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500/30 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2 italic">Pipeline Lattice</label>
                          <select value={formData.pipelineId} onChange={(e) => setFormData({...formData, pipelineId: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs text-indigo-400 outline-none focus:border-indigo-500/30 appearance-none font-bold">
                             {pipelines.map(p => (
                               <option key={p.id} value={p.id} className="bg-[#0b0f19]">{p.name}</option>
                             ))}
                          </select>
                       </div>
                    </div>
                 </div>
              )}
           </div>

           <div className="pt-10 flex gap-6">
              <button onClick={onClose} className="flex-1 py-5 rounded-[24px] bg-white/[0.03] border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-all">Abort Handshake</button>
              <button 
                onClick={handleConvert} 
                disabled={loading}
                className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[32px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 group transition-all"
              >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                   <>
                     Execute Conversion Protocol
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
                   </>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
