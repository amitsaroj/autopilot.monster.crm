"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Terminal,
  Activity,
  HardDrive,
  Cpu,
  Loader2,
  Zap,
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
import { adminMetricsService, type GlobalPlatformStats } from "@/services/admin-metrics.service";
import { adminHealthService } from "@/services/admin-health.service";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<GlobalPlatformStats | null>(null);
  const [healthLoad, setHealthLoad] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [globalStats, healthRes] = await Promise.all([
          adminMetricsService.getGlobal(),
          adminHealthService.getHealth(),
        ]);
        if (globalStats) {
          setStats(globalStats);
        }
        const health = healthRes.data.data;
        if (health?.memory?.usage?.heapUsed && health.memory.total) {
          const heapPct = (health.memory.usage.heapUsed / health.memory.total) * 100;
          setHealthLoad(Math.round(heapPct));
        }
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  const chartData = [
    {
      name: "Tenants",
      value: stats?.tenants ?? 0,
    },
    {
      name: "Users",
      value: stats?.users ?? 0,
    },
    {
      name: "Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
    },
    {
      name: "Revenue",
      value: Math.round((stats?.totalRevenue ?? 0) / 1000),
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Control Center</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Global Infrastructure Oversight
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">
            Live Platform Metrics
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Platform Revenue",
            value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
            icon: CreditCard,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
          },
          {
            label: "Active Tenants",
            value: stats?.tenants ?? 0,
            icon: Building2,
            color: "text-indigo-400",
            bg: "bg-indigo-400/10",
          },
          {
            label: "Total User Profiles",
            value: stats?.users ?? 0,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            label: "Active Subscriptions",
            value: stats?.activeSubscriptions ?? 0,
            icon: Zap,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all hover:border-indigo-500/20 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </div>
            <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
              {kpi.label}
            </h3>
            <p className="text-3xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Platform Snapshot
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff20"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0f19",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" /> Cluster Resources
          </h3>
          <div className="space-y-6">
            {[
              { label: "Heap Usage", value: healthLoad, icon: Cpu, color: "bg-blue-500" },
              {
                label: "Active Tenants",
                value: Math.min(100, (stats?.tenants ?? 0) * 5),
                icon: Building2,
                color: "bg-purple-500",
              },
              {
                label: "Subscriptions",
                value: Math.min(100, (stats?.activeSubscriptions ?? 0) * 10),
                icon: HardDrive,
                color: "bg-indigo-500",
              },
            ].map((resource) => (
              <div key={resource.label} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
                    <resource.icon className="w-3.5 h-3.5" /> {resource.label}
                  </span>
                  <span className="text-xs font-black text-white">{resource.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${resource.color} rounded-full`}
                    style={{ width: `${resource.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-10 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-black text-white">Advanced Platform Settings</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Configure global multi-tenant overrides, manage platform-wide feature flags, and
              orchestrate automated infrastructure backups.
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 uppercase tracking-widest">
            <Terminal className="w-4 h-4" /> Global Config
          </button>
        </div>
      </div>
    </div>
  );
}
