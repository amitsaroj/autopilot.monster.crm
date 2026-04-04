"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Mic, PhoneCall, Volume2, Calendar, Zap, MoreVertical, LayoutGrid, CheckCircle2, Clock, BarChart4, PlayCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VoiceCampaignsPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const campaigns = [
    { id: "VCP-001", name: "Inbound IVR Flow A", type: "INBOUND", status: "ACTIVE", calls: 1200, latency: "125ms" },
    { id: "VCP-002", name: "Outbound Power Dialer", type: "OUTBOUND", status: "PAUSED", calls: 450, latency: "110ms" },
    { id: "VCP-003", name: "Strategic Survey", type: "OUTBOUND", status: "DRAFT", calls: 0, latency: "N/A" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                 Acoustic Orchestration Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Campaign Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage automated IVR flows, outbound power dialers, and acoustic engagement cycles</p>
        </div>
        <button className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Campaign
        </button>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-violet-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-violet-400" />
            <input 
               type="text" 
               placeholder="Search campaign designation..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {campaigns.map((camp) => (
           <div key={camp.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-violet-500/5 transition-colors pointer-events-none" />
                
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-400 transition-all shadow-2xl relative">
                         <Volume2 className="w-6 h-6" />
                      </div>
                      <button className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <h3 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight mb-2 leading-none">{camp.name}</h3>
                   <div className="flex items-center gap-2 mb-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                        camp.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-white/5 text-gray-500 border-white/10"
                      )}>
                        {camp.status}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] text-gray-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                        {camp.type} TARGET
                      </span>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest">
                         <div className="flex items-center gap-2 font-bold"><Zap className="w-3.5 h-3.5 text-amber-500" /> Throughput Latency</div>
                         <div className="text-white">{camp.latency}</div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest">
                         <div className="flex items-center gap-2 font-bold"><PhoneCall className="w-3.5 h-3.5 text-indigo-400" /> Executed Conversions</div>
                         <div className="text-white">{camp.calls}</div>
                      </div>
                   </div>
                </div>

                <div className="pt-6 mt-8 flex items-center justify-between">
                   <button className="flex-1 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl text-[9px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-all">
                      Analyze Strategy
                   </button>
                   <button className="p-3 ml-2 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                      <PlayCircle className="w-5 h-5" />
                   </button>
                </div>
           </div>
         ))}
      </div>

      <div className="md:col-span-3 p-10 rounded-[50px] bg-violet-600/5 border border-violet-600/10 flex items-center gap-10">
         <div className="w-20 h-20 rounded-[32px] bg-violet-600/10 flex items-center justify-center text-violet-400 shadow-inner">
            <Mic className="w-10 h-10" />
         </div>
         <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Omnipresent Acoustic Compliance</h4>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-4xl leading-relaxed">System-wide enforcement of STIR/SHAKEN protocols and automated TCPA compliance filters are applied to all outbound voice campaigns to minimize regulatory friction.</p>
         </div>
      </div>
    </div>
  );
}
