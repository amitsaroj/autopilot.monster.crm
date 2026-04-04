"use client";

import { useState } from "react";
import { Upload, Palette, Globe, Target, Shield, Check, Info, Layout, Camera, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function BrandingPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "Autopilot Monster CRM",
    primaryColor: "#6366f1",
    secondaryColor: "#10b981",
    fontFamily: "Inter, sans-serif",
    logoUrl: "",
    faviconUrl: "",
    customDomain: "crm.mycompany.com",
    whiteLabel: true,
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Brand identity synchronized successully");
    setLoading(false);
  };

  const colors = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Sky", hex: "#0ea5e9" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Violet", hex: "#8b5cf6" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Identity Layer Active
              </span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Brand Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">Master configuration of tenant visual identity and white-labeling</p>
        </div>
        <button 
           onClick={handleSave} 
           disabled={loading}
           className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-2 group"
        >
           {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
           Synchronize Identity
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visual Identity */}
        <div className="lg:col-span-12 space-y-8">
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Camera className="w-7 h-7 text-indigo-500" /> Digital Artifacts
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Logo Upload */}
                 <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Corporate Emblem (Logo)</label>
                    <div className="aspect-video rounded-[32px] bg-white/[0.02] border-2 border-dashed border-white/5 flex flex-col items-center justify-center group/upload cursor-pointer hover:border-indigo-500/20 transition-all">
                       <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-500 group-hover/upload:bg-indigo-500 group-hover/upload:text-white transition-all shadow-inner">
                          <Upload className="w-7 h-7" />
                       </div>
                       <p className="mt-4 text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover/upload:text-indigo-400">Transmit Artifact</p>
                       <p className="text-[9px] text-gray-700 mt-1 uppercase font-bold">SVG, PNG, Or WEBP (Max 2MB)</p>
                    </div>
                 </div>

                 {/* Favicon Upload */}
                 <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Browser Marker (Favicon)</label>
                    <div className="aspect-square w-32 rounded-[32px] bg-white/[0.02] border-2 border-dashed border-white/5 flex flex-col items-center justify-center group/upload cursor-pointer hover:border-indigo-500/20 transition-all mx-auto md:ml-0">
                       <Layout className="w-7 h-7 text-gray-600 group-hover/upload:text-indigo-400 transition-colors" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Color Palette */}
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Palette className="w-7 h-7 text-emerald-500" /> Chromatic Palette
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Primary Vector</label>
                    <div className="flex flex-wrap gap-4">
                       {colors.map((c) => (
                         <button 
                           key={c.hex} 
                           onClick={() => setFormData({...formData, primaryColor: c.hex})}
                           className={`w-14 h-14 rounded-2xl transition-all border-4 shadow-xl ${formData.primaryColor === c.hex ? 'border-white scale-110 shadow-indigo-500/20' : 'border-transparent opacity-40 hover:opacity-100'}`}
                           style={{ backgroundColor: c.hex }}
                           title={c.name}
                         />
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Manual Override</label>
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                       <input 
                         type="text" 
                         value={formData.primaryColor}
                         onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                         className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm tracking-widest uppercase"
                       />
                       <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: formData.primaryColor }} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Custom Domain */}
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Globe className="w-7 h-7 text-sky-500" /> DNS Orchestration
              </h2>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Custom Subdomain / Root</label>
                    <input 
                      type="text" 
                      value={formData.customDomain}
                      onChange={(e) => setFormData({...formData, customDomain: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500/40 shadow-inner"
                      placeholder="e.g. login.mycompany.com"
                    />
                 </div>
                 
                 <div className="flex items-center gap-6 p-8 rounded-[32px] bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-xl">
                    <Shield className="w-10 h-10 text-indigo-400 shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Strict White-Labeling</h4>
                       <p className="text-[9px] text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">Remove all "Autopilot Monster" signatures from client-facing portals, emails, and system logs.</p>
                    </div>
                    <div 
                      onClick={() => setFormData({...formData, whiteLabel: !formData.whiteLabel})}
                      className={`ml-auto w-16 h-8 rounded-full border border-white/10 p-1 cursor-pointer transition-all ${formData.whiteLabel ? 'bg-indigo-500' : 'bg-gray-800'}`}
                    >
                       <div className={`w-6 h-6 rounded-full bg-white shadow-xl transition-all ${formData.whiteLabel ? 'translate-x-8' : 'translate-x-0'}`} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
