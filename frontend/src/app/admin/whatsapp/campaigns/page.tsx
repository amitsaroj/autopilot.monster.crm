"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Send, MessageSquare, Calendar, Zap, MoreVertical, LayoutGrid, CheckCircle2, Clock, Smartphone, Phone, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function WhatsAppCampaignsPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const campaigns = [
    { id: "WCP-001", name: "Summer Promo 2025", status: "SCHEDULED", recipients: 1200, date: "2025-06-01 10:00:00" },
    { id: "WCP-002", name: "User Reactivation", status: "SENT", recipients: 450, date: "2025-03-15 14:30:00" },
    { id: "WCP-003", name: "New Feature Alert", status: "DRAFT", recipients: 0, date: "N/A" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "SCHEDULED": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default: return "text-gray-400 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Acquisition Vector Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Broadcast Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage bulk WhatsApp engagement vectors and scheduled transmission clusters</p>
        </div>
        <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Campaign
        </button>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-emerald-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400" />
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
           <div key={camp.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-emerald-500/5 transition-colors pointer-events-none" />
              
              <div>
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shadow-2xl relative">
                       <Send className="w-6 h-6" />
                    </div>
                    <button className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>

                 <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight mb-2 leading-none">{camp.name}</h3>
                 <div className="flex items-center gap-2 mb-6">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                      getStatusColor(camp.status)
                    )}>
                      {camp.status}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] text-gray-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                      {camp.recipients} Recipients
                    </span>
                 </div>
              </div>

              <div className="pt-6 mt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> {camp.date}
                 </div>
                 <button className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/5 transition-all">
                   <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Info */}
      <div className="md:col-span-3 p-10 rounded-[50px] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-8">
         <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
            <Zap className="w-10 h-10" />
         </div>
         <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Template-Based High Frequency Transmission</h4>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-3xl leading-relaxed">All WhatsApp broadcast campaigns utilize pre-approved Facebook templates to ensure maximum delivery rates and minimize account risk nodes.</p>
         </div>
      </div>

    </div>
  );
}
