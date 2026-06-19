"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { parseApiData } from "@/lib/api/parse-response";
import {
  whatsappBroadcastService,
  type WhatsappBroadcast,
} from "@/services/whatsapp-broadcast.service";

export default function WhatsAppCampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<WhatsappBroadcast[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await whatsappBroadcastService.list();
        setCampaigns(parseApiData<WhatsappBroadcast[]>(res) ?? []);
      } catch {
        toast.error("Failed to load WhatsApp campaigns");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = campaigns.filter((camp) =>
    camp.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
      case "COMPLETED":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "SCHEDULED":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-gray-400 bg-white/5 border-white/10";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Acquisition Vector Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight text-sans">Broadcast Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Manage bulk WhatsApp engagement vectors and scheduled transmission clusters
          </p>
        </div>
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
        {filtered.map((camp) => (
          <div
            key={camp.id}
            className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shadow-2xl relative">
                  <Send className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await whatsappBroadcastService.remove(camp.id);
                      setCampaigns((prev) => prev.filter((item) => item.id !== camp.id));
                      toast.success("Campaign removed");
                    } catch {
                      toast.error("Failed to remove campaign");
                    }
                  }}
                  className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight mb-2 leading-none">
                {camp.name}
              </h3>
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                    getStatusColor(camp.status),
                  )}
                >
                  {camp.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/[0.05]">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Recipients</span>
                <span className="text-white">{camp.total}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Sent</span>
                <span className="text-emerald-400">{camp.sent}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Scheduled</span>
                <span className="text-gray-300">
                  {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleString() : "Immediate"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 text-sm">
            No WhatsApp campaigns found.
          </div>
        )}
      </div>
    </div>
  );
}
