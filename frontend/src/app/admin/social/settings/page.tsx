"use client";

import { useState } from "react";
import { Share2, Facebook, Instagram, Linkedin, Twitter, Key, Shield, Globe, RefreshCcw, Save, Trash2, Plus, Zap, Info, Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SocialSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([
    { platform: "Facebook", status: "CONNECTED", account: "Acme Corp Official", icon: Facebook, color: "text-blue-500" },
    { platform: "Instagram", status: "CONNECTED", account: "@acmedynamics", icon: Instagram, color: "text-rose-500" },
    { platform: "LinkedIn", status: "DISCONNECTED", account: "N/A", icon: Linkedin, color: "text-sky-600" },
  ]);

  const handleConnect = (platform: string) => {
    toast.message(`Initializing OAuth handshake for ${platform}...`);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[40px] border border-white/[0.05] backdrop-blur-md">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                 Amplification Layer Active
              </span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Social Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 font-bold uppercase tracking-widest">Manage platform OAuth handshakes, API keys, and global post-scheduling parameters</p>
        </div>
        <button 
           className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2 group"
        >
           <Plus className="w-4 h-4 group-hover:scale-110 transition-all" />
           Initalize Connection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {connections.map((conn) => (
           <div key={conn.platform} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
              
              <div>
                 <div className="flex justify-between items-start mb-6">
                    <div className={cn("w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center transition-all shadow-2xl relative", conn.color)}>
                       <conn.icon className="w-7 h-7" />
                       {conn.status === "CONNECTED" && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0b0f19] shadow-lg" />}
                    </div>
                    {conn.status === "CONNECTED" ? (
                      <button className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleConnect(conn.platform)} className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">
                         Initialize
                      </button>
                    )}
                 </div>

                 <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-2 leading-none">{conn.platform}</h3>
                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6">{conn.account}</p>
                 
                 <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                      conn.status === "CONNECTED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-gray-500 border-white/10"
                    )}>
                      {conn.status}
                    </span>
                 </div>
              </div>

              <div className="pt-6 mt-8 border-t border-white/5 flex items-center justify-between">
                 <button className="flex-1 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl text-[9px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">
                    Re-Verify Protocol
                 </button>
              </div>
           </div>
         ))}
         
         <div className="p-10 rounded-[50px] bg-white/[0.01] border-2 border-dashed border-white/5 flex flex-col items-center justify-center group/add cursor-pointer hover:border-blue-500/30 transition-all m-2">
            <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-gray-600 group-hover/add:bg-blue-500 group-hover/add:text-white transition-all shadow-inner">
               <Plus className="w-8 h-8" />
            </div>
            <p className="mt-4 text-[10px] font-black text-gray-700 uppercase tracking-widest group-hover/add:text-blue-400 transition-colors">Append Platform</p>
         </div>
      </div>

      <div className="p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] flex items-center gap-8">
         <Shield className="w-16 h-16 text-blue-400 opacity-40 shrink-0" />
         <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Omnipresent Secret Management</h4>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-3xl leading-relaxed">System-wide OAuth tokens and API secrets are stored in an encrypted vault. Rotating credentials periodically is encouraged to minimize exploitation vectors.</p>
         </div>
         <div className="ml-auto px-8 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4" /> Vault Active
         </div>
      </div>
    </div>
  );
}
