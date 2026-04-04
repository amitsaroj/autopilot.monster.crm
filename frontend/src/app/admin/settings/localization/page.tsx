"use client";

import { useState } from "react";
import { Globe, Clock, DollarSign, Languages, Save, RefreshCw, MapPin, Calendar, Check, Info } from "lucide-react";
import { toast } from "sonner";

export default function LocalizationPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Global locale synchronized successfully");
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                 Locale Layer Active
              </span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Locale Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">Configure global system language, temporal zones, and fiscal currency</p>
        </div>
        <button 
           onClick={handleSave} 
           disabled={loading}
           className="px-10 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-violet-500/20 flex items-center gap-2 group"
        >
           {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-all" />}
           Save Configurations
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Language & Timezone */}
        <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <Languages className="w-7 h-7 text-violet-500" /> Dialect & Time
           </h2>
           
           <div className="space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">System Primary Language</label>
                 <select className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-violet-400 font-bold outline-none focus:border-violet-500/40 appearance-none cursor-pointer">
                    <option value="en" className="bg-[#0b0f19]">English (Global Standard)</option>
                    <option value="es" className="bg-[#0b0f19]">Español (Standard)</option>
                    <option value="fr" className="bg-[#0b0f19]">Français (European)</option>
                    <option value="de" className="bg-[#0b0f19]">Deutsch (DACH)</option>
                 </select>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Temporal Zone (Timezone)</label>
                 <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                    <select className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] pl-16 pr-8 py-5 text-sm text-violet-400 font-bold outline-none focus:border-violet-500/40 appearance-none cursor-pointer">
                       <option value="UTC" className="bg-[#0b0f19]">Coordinated Universal Time (UTC)</option>
                       <option value="EST" className="bg-[#0b0f19]">Eastern Standard Time (EST)</option>
                       <option value="PST" className="bg-[#0b0f19]">Pacific Standard Time (PST)</option>
                       <option value="IST" className="bg-[#0b0f19]">Indian Standard Time (IST)</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* Currency & Format */}
        <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
              <DollarSign className="w-7 h-7 text-emerald-500" /> Fiscal & Formats
           </h2>

           <div className="space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Primary Fiscal Unit (Currency)</label>
                 <select className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500/40 appearance-none cursor-pointer">
                    <option value="USD" className="bg-[#0b0f19]">US Dollar ($)</option>
                    <option value="EUR" className="bg-[#0b0f19]">Euro (€)</option>
                    <option value="GBP" className="bg-[#0b0f19]">British Pound (£)</option>
                    <option value="INR" className="bg-[#0b0f19]">Indian Rupee (₹)</option>
                 </select>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Date Notation Format</label>
                 <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <select className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] pl-16 pr-8 py-5 text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500/40 appearance-none cursor-pointer">
                       <option value="MM/DD/YYYY" className="bg-[#0b0f19]">MM/DD/YYYY (USA)</option>
                       <option value="DD/MM/YYYY" className="bg-[#0b0f19]">DD/MM/YYYY (Global)</option>
                       <option value="YYYY-MM-DD" className="bg-[#0b0f19]">YYYY-MM-DD (ISO)</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {/* Regional Lock */}
        <div className="md:col-span-2 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-10">
           <div className="w-20 h-20 rounded-[32px] bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <MapPin className="w-10 h-10" />
           </div>
           <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">Enforce Regional Compliance</h4>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-2xl leading-relaxed">System-wide enforcement of local tax laws, currency symbols, and data residency protocols based on tenant headquarters.</p>
           </div>
           <div className="ml-auto flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Check className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Compliance Active</span>
           </div>
        </div>

      </div>
    </div>
  );
}
