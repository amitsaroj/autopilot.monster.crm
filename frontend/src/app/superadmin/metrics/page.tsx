"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  RefreshCw,
  Server,
  Database,
  Loader2,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { adminHealthService, type SystemHealth } from "@/services/admin-health.service";

interface TelemetryPoint {
  time: string;
  cpu: number;
  memory: number;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

export default function SystemMetricsPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [series, setSeries] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await adminHealthService.getHealth();
      const data = res.data.data;
      if (!data) {
        return;
      }
      setHealth(data);
      const cpuLoad = data.cpu.load[0] ?? 0;
      const memPct =
        data.memory.total > 0
          ? Math.round(((data.memory.total - data.memory.free) / data.memory.total) * 100)
          : 0;
      const label = new Date(data.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setSeries((prev) => [...prev.slice(-19), { time: label, cpu: Math.round(cpuLoad * 100), memory: memPct }]);
    } catch {
      toast.error("Failed to sync infrastructure telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
    const interval = setInterval(() => {
      void fetchHealth();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading && !health) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              Telemetry Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Infrastructure Observability
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Node.js Runtime & Hardware Metrics
          </p>
        </div>
        <button
          onClick={() => void fetchHealth()}
          className="px-6 py-3 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Force Polling
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "System Uptime",
            value: `${((health?.uptime ?? 0) / 3600).toFixed(1)} Hours`,
            icon: Clock,
            color: "text-indigo-400",
            sub: "Process Persistence",
          },
          {
            label: "Available RAM",
            value: formatBytes(health?.memory?.free ?? 0),
            icon: Database,
            color: "text-blue-400",
            sub: `${health?.memory?.total ? Math.round((health.memory.free / health.memory.total) * 100) : 0}% Free`,
          },
          {
            label: "CPU Load (1m)",
            value: (health?.cpu?.load[0] ?? 0).toFixed(2),
            icon: Cpu,
            color: "text-amber-400",
            sub: `${health?.cpu?.count ?? 0} Physical Cores`,
          },
          {
            label: "Heap Usage",
            value: formatBytes(health?.memory?.usage?.heapUsed ?? 0),
            icon: Gauge,
            color: "text-emerald-400",
            sub: "Managed GC Heap",
          },
        ].map((tile) => (
          <div
            key={tile.label}
            className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden group"
          >
            <div className="mb-4 flex justify-between">
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 group-hover:scale-110 transition-transform">
                <tile.icon className={`w-5 h-5 ${tile.color}`} />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {tile.label}
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{tile.value}</h3>
            <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-tighter">
              {tile.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
          <h3 className="text-white font-bold flex items-center gap-3">
            <Gauge className="w-5 h-5 text-indigo-500" /> Live Workload Analysis
          </h3>
          {series.length === 0 ? (
            <p className="text-sm text-gray-500 py-24 text-center">
              Collecting telemetry samples…
            </p>
          ) : (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                  <XAxis
                    dataKey="time"
                    stroke="#ffffff10"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#ffffff10" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#060a14",
                      border: "1px solid #ffffff10",
                      borderRadius: "16px",
                    }}
                    itemStyle={{ fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                    name="CPU %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMem)"
                    name="RAM %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-6">
          <h3 className="text-white font-bold flex items-center gap-3">
            <Server className="w-5 h-5 text-gray-500" /> Runtime Manifest
          </h3>
          <div className="space-y-4">
            {[
              { label: "OS Kernel", value: health?.platform ?? "—", icon: Server },
              { label: "Engine", value: health?.nodeVersion ?? "—", icon: Activity },
              { label: "Status", value: health?.status ?? "—", icon: CheckCircle2 },
              { label: "Last Check", value: health?.timestamp ? new Date(health.timestamp).toLocaleString() : "—", icon: Clock },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <row.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                </div>
                <span className="text-xs font-black text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
