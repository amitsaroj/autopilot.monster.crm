"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Shield, Smartphone, Server, Save, RefreshCw, Key, Globe, Radio, Zap } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Notification protocols synchronized successfully");
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Transmission Layer Active
              </span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Protocol Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">Configure global notification providers, SMTP gateways, and SMS clusters</p>
        </div>
        <button 
           onClick={handleSave} 
           className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-2 group"
        >
           {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-all font-black text-xl" />}
           Execute Synchronization
        </button>
      </div>

      <div className="flex gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm shadow-inner group">
         {[
           { id: "email", icon: Mail, label: "Email SMTP" },
           { id: "sms", icon: MessageSquare, label: "SMS Gateway" },
           { id: "push", icon: Bell, label: "Push Nodes" },
           { id: "whatsapp", icon: Smartphone, label: "WhatsApp" }
         ].map((t) => (
           <button
             key={t.id}
             onClick={() => setActiveTab(t.id)}
             className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
           >
             <t.icon className="w-4 h-4" /> {t.label}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {activeTab === "email" && (
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Server className="w-7 h-7 text-indigo-500" /> SMTP Protocol
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">SMTP Host Vector</label>
                    <input type="text" className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500/40" placeholder="smtp.postmarkapp.com" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Secure Port</label>
                    <input type="text" className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500/40" placeholder="587" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Identity (Username)</label>
                    <input type="text" className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500/40" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Secret Identity (Password)</label>
                    <input type="password" title="password" className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-indigo-400 font-bold outline-none focus:border-indigo-500/40" />
                 </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                 <Shield className="w-6 h-6 text-indigo-400" />
                 <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">STARTTLS encryption is enforced for all outbound transmissions.</p>
              </div>
           </div>
        )}

        {activeTab === "sms" && (
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Radio className="w-7 h-7 text-emerald-500" /> Twilio SMS Node
              </h2>
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Account SID</label>
                    <div className="relative">
                       <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                       <input type="text" className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] pl-16 pr-8 py-5 text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500/40 shadow-inner" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Auth Token</label>
                    <input type="password" title="password" className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] px-8 py-5 text-sm text-emerald-400 font-bold outline-none focus:border-emerald-500/40 shadow-inner" />
                 </div>
              </div>
           </div>
        )}

        {activeTab === "push" && (
           <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-4">
                 <Zap className="w-7 h-7 text-amber-500" /> VAPID Orchestration
              </h2>
              <div className="space-y-6 flex flex-col md:flex-row gap-8 items-start">
                 <div className="flex-1 w-full space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Public VAPID Key</label>
                    <textarea title="VAPID Key" className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-xs text-amber-500 font-mono outline-none min-h-[120px] shadow-inner" />
                 </div>
                 <div className="flex items-center gap-4 bg-amber-500/10 p-6 rounded-[32px] border border-amber-500/20 max-w-sm">
                    <Smartphone className="w-10 h-10 text-amber-400 shrink-0" />
                    <div>
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Mobile Push Active</h4>
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter leading-relaxed">Required for web-push notifications across Chrome, Safari, and Firefox.</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
