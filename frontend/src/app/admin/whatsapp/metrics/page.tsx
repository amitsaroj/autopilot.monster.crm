"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, MessageSquare, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { analyticsService } from "@/services/analytics.service";

export default function WhatsAppMetricsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ total: 0, inbound: 0, outbound: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getWhatsapp();
      if (data) {
        setMetrics(data);
      }
    } catch {
      toast.error("Failed to load WhatsApp metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const deliveryRate =
    metrics.total > 0 ? Math.round((metrics.outbound / metrics.total) * 100) : 0;
  const responseRate =
    metrics.outbound > 0 ? Math.round((metrics.inbound / metrics.outbound) * 100) : 0;

  const stats = [
    {
      label: "Total Messages",
      value: metrics.total.toLocaleString(),
      change: "",
      trending: "up" as const,
      color: "text-emerald-400",
    },
    {
      label: "Outbound",
      value: metrics.outbound.toLocaleString(),
      change: `${deliveryRate}% of total`,
      trending: "up" as const,
      color: "text-blue-400",
    },
    {
      label: "Inbound",
      value: metrics.inbound.toLocaleString(),
      change: `${responseRate}% response`,
      trending: metrics.inbound >= metrics.outbound ? ("up" as const) : ("down" as const),
      color: "text-amber-400",
    },
    {
      label: "Active Threads",
      value: metrics.inbound.toLocaleString(),
      change: "inbound conversations",
      trending: "up" as const,
      color: "text-violet-400",
    },
  ];

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
              Analytics Layer Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight text-sans">
            Telemetric Intelligence
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            WhatsApp message performance from live tenant data
          </p>
        </div>
        <button
          onClick={() => void load()}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-all" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all"
          >
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">
              {s.label}
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className={cn("text-4xl font-black tracking-tighter", s.color)}>{s.value}</h2>
              {s.change && (
                <span
                  className={cn(
                    "text-[10px] font-black uppercase flex items-center gap-1",
                    s.trending === "up" ? "text-emerald-500" : "text-red-500",
                  )}
                >
                  <TrendingUp
                    className={cn("w-3 h-3", s.trending === "down" && "rotate-180")}
                  />
                  {s.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl min-h-[400px] flex flex-col items-center justify-center">
          {metrics.total === 0 ? (
            <>
              <MessageSquare className="w-20 h-20 text-gray-800 mb-6 opacity-20" />
              <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest italic">
                No WhatsApp messages yet
              </h3>
              <p className="text-[10px] text-gray-700 font-bold uppercase mt-2 tracking-tighter">
                Metrics will populate once messages are sent or received
              </p>
            </>
          ) : (
            <>
              <BarChart3 className="w-20 h-20 text-emerald-500/30 mb-6" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {metrics.outbound.toLocaleString()} outbound · {metrics.inbound.toLocaleString()}{" "}
                inbound
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 tracking-tighter">
                Live message counts from analytics API
              </p>
            </>
          )}
        </div>

        <div className="lg:col-span-1 p-10 rounded-[50px] bg-white/[0.01] border border-white/[0.05] shadow-2xl space-y-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            Channel Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Total Volume
              </span>
              <span className="text-[10px] font-black text-emerald-400">{metrics.total}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Outbound Share
              </span>
              <span className="text-[10px] font-black text-blue-400">{deliveryRate}%</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Inbound Share
              </span>
              <span className="text-[10px] font-black text-amber-400">
                {metrics.total > 0 ? Math.round((metrics.inbound / metrics.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
