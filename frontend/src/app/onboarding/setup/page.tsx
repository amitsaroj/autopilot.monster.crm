"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Building2, MapPin, Globe, CheckCircle2, ChevronRight, Rocket, Briefcase, Users, Layout } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingSetupPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: "TECHNOLOGY",
    employees: "1-10",
    country: "USA",
  });

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Organization profile materialized");
    setLoading(false);
    // Redirect to next onboarding stage
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center p-6 text-sans">
      <div className="max-w-xl w-full p-12 rounded-[50px] bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 space-y-10">
           <div className="flex justify-between items-center mb-12">
              <div className="w-16 h-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                 <Rocket className="w-8 h-8" />
              </div>
              <div className="flex gap-2">
                 {[1, 2].map((i) => (
                   <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-500 border border-white/10", step >= i ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/5")} />
                 ))}
              </div>
           </div>

           <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 leading-none">
                 {step === 1 ? "Organization Identity" : "Industry Extraction"}
              </h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Onboarding Phase 01: Core Matrix Configuration</p>
           </div>

           {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Entity Designation (Company Name)</label>
                    <div className="relative">
                       <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                       <input required type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/40 shadow-inner" placeholder="Acme Dynamics" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Digital Domain (Website)</label>
                    <div className="relative">
                       <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                       <input type="text" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/40 shadow-inner" placeholder="https://acme.org" />
                    </div>
                 </div>
              </div>
           ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Market Sector</label>
                    <div className="relative">
                       <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                       <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-sm text-emerald-400 font-bold outline-none appearance-none cursor-pointer">
                          <option value="TECHNOLOGY" className="bg-[#0b0f19]">Information Technology</option>
                          <option value="FINANCE" className="bg-[#0b0f19]">Fiscal Services</option>
                          <option value="HEALTHCARE" className="bg-[#0b0f19]">Bioscience & Health</option>
                          <option value="RETAIL" className="bg-[#0b0f19]">Consumer Goods</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Human Resource count</label>
                    <div className="relative">
                       <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                       <select value={formData.employees} onChange={(e) => setFormData({...formData, employees: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-sm text-emerald-400 font-bold outline-none appearance-none cursor-pointer">
                          <option value="1-10" className="bg-[#0b0f19]">1 - 10 Operatives</option>
                          <option value="11-50" className="bg-[#0b0f19]">11 - 50 Operatives</option>
                          <option value="51-200" className="bg-[#0b0f19]">51 - 200 Operatives</option>
                          <option value="200+" className="bg-[#0b0f19]">Enterprise Vector (200+)</option>
                       </select>
                    </div>
                 </div>
              </div>
           )}

           <div className="pt-10 flex gap-4">
              {step > 1 && (
                 <button onClick={() => setStep(step - 1)} className="px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Previous</button>
              )}
              <button 
                onClick={nextStep} 
                disabled={loading}
                className="flex-1 px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 group transition-all"
              >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin font-black text-xl" /> : (
                   <>
                     {step === 2 ? "Finalize Configuration" : "Next Protocol"}
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
