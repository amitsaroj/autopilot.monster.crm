"use client";

import { useState } from "react";
import { Cpu, Zap, Shield, Key, Sliders, BarChart3, Save, RefreshCw, MessageSquare, Bot, Database, Info, Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AISettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    defaultModel: "gpt-4-turbo",
    maxTokens: 4096,
    temperature: 0.7,
    autoAgent: true,
    dataPrivacy: "HIGH",
  });

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("AI Orchestration parameters synchronized");
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                 Cognitive Layer Active
              </span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">AI Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">Master configuration of LLM models, agent behaviors, and token quotas</p>
        </div>
        <button 
           onClick={handleSave} 
           disabled={loading}
           className="px-10 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-violet-500/20 flex items-center gap-2 group"
        >
           {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-all" />}
           Save Logic
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Model Configuration */}
        <div className="lg:col-span-12 space-y-8">
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Cpu className="w-7 h-7 text-violet-500" /> Neural Model Selection
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Primary Inference Model</label>
                    <select value={formData.defaultModel} onChange={(e) => setFormData({...formData, defaultModel: e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-violet-400 font-bold outline-none focus:border-violet-500/40 appearance-none cursor-pointer">
                       <option value="gpt-4-turbo" className="bg-[#0b0f19]">OpenAI GPT-4 Turbo (Balanced)</option>
                       <option value="claude-3-opus" className="bg-[#0b0f19]">Anthropic Claude 3 Opus (Premium)</option>
                       <option value="gemini-1.5-pro" className="bg-[#0b0f19]">Google Gemini 1.5 Pro (Extreme Context)</option>
                       <option value="llama-3-70b" className="bg-[#0b0f19]">Meta Llama 3 70B (Open Core)</option>
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Maximum Token Vector</label>
                    <input type="number" value={formData.maxTokens} onChange={(e) => setFormData({...formData, maxTokens: parseInt(e.target.value)})} className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-violet-400 font-bold outline-none focus:border-violet-500/40 shadow-inner" />
                 </div>
              </div>
           </div>

           {/* Agent Behavior */}
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Bot className="w-7 h-7 text-emerald-500" /> Autonomous Parameters
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="flex items-center gap-6 p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-xl">
                       <Zap className="w-10 h-10 text-emerald-400 shrink-0" />
                       <div>
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Autonomous Agency</h4>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter leading-relaxed">Allow AI agents to autonomously trigger workflows, send emails, and modify CRM records.</p>
                       </div>
                       <div 
                         onClick={() => setFormData({...formData, autoAgent: !formData.autoAgent})}
                         className={cn("ml-auto w-16 h-8 rounded-full border border-white/10 p-1 cursor-pointer transition-all", formData.autoAgent ? "bg-emerald-500" : "bg-gray-800")}
                       >
                          <div className={cn("w-6 h-6 rounded-full bg-white shadow-xl transition-all", formData.autoAgent ? "translate-x-8" : "translate-x-0")} />
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Neural Temperature (Creativity)</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={formData.temperature} 
                      onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      className="w-full accent-emerald-500 h-2 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest mt-2">
                       <span>Precise (0.0)</span>
                       <span>Creative (1.0)</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Info Box */}
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-8">
              <Shield className="w-16 h-16 text-violet-400 opacity-40 shrink-0" />
              <div>
                 <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Zero-Retention Data Policy</h4>
                 <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-3xl leading-relaxed">System-wide enforcement of data privacy. No user-specific data is utilized for model training by upstream LLM providers (OpenAI, Anthropic, Google) under our Enterprise SLA.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
