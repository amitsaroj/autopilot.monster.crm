"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, Loader2, Volume2, PhoneCall, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { voiceCampaignService, VoiceCampaign } from "@/services/voice-campaign.service";

export default function VoiceCampaignsPage() {
  const [campaigns, setCampaigns] = useState<VoiceCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await voiceCampaignService.list();
      setCampaigns(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await voiceCampaignService.remove(id);
      toast.success("Campaign deleted");
      void load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleStart = async (id: string) => {
    try {
      await voiceCampaignService.start(id);
      toast.success("Campaign started");
      void load();
    } catch {
      toast.error("Failed to start campaign");
    }
  };

  const filtered = campaigns.filter((camp) =>
    camp.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight text-sans">Campaign Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1">Manage voice campaigns</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No campaigns yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((camp) => (
            <div
              key={camp.id}
              className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/20 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => void handleDelete(camp.id)}
                    className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-black text-white mb-2">{camp.name}</h3>
                <span
                  className={cn(
                    "inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase border",
                    camp.status === "RUNNING"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-white/5 text-gray-500 border-white/10",
                  )}
                >
                  {camp.status}
                </span>

                <div className="space-y-4 pt-4 mt-4 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase">
                    <span className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5" /> Calls Made
                    </span>
                    <span className="text-white">{camp.callsMade}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase">
                    <span>Answered</span>
                    <span className="text-white">{camp.callsAnswered}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => void handleStart(camp.id)}
                  className="p-3 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <PlayCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
