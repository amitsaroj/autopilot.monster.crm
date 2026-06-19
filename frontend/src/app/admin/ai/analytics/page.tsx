"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Zap,
  Star,
  ArrowUpRight,
  Activity,
  Loader2,
  Bot,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { analyticsService } from "@/services/analytics.service";
import { aiAgentService, type Agent } from "@/services/ai-agent.service";
import { parseApiData } from "@/lib/api/parse-response";

function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }
  return String(value);
}

export default function AdminAIAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({
    tokensUsed: 0,
    messagesSent: 0,
    totalCost: 0,
    periodStart: "",
  });
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aiUsage, agentsRes] = await Promise.all([
          analyticsService.getAiUsage(),
          aiAgentService.list(),
        ]);
        if (aiUsage) {
          setUsage(aiUsage);
        }
        setAgents(parseApiData<Agent[]>(agentsRes) ?? []);
      } catch {
        toast.error("Failed to load AI analytics");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const stats = [
    {
      label: "Messages Sent",
      value: usage.messagesSent.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Agents",
      value: String(agents.filter((a) => a.isActive).length),
      icon: Bot,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Agents",
      value: String(agents.length),
      icon: Star,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Tokens This Period",
      value: formatTokens(usage.tokensUsed),
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  const tokenChart = [
    {
      label: "Current Period",
      tokens: usage.tokensUsed,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">AI Analytics</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Performance Metrics & Usage Intelligence
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {s.label}
            </p>
            <p className="text-2xl font-black text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Token Usage
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tokenChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis
                dataKey="label"
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
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="tokens" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
            Period start: {usage.periodStart ? new Date(usage.periodStart).toLocaleDateString() : "—"}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6">
            Cost Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-black">
                Total Cost
              </span>
              <span className="text-lg font-black text-emerald-400">
                ${usage.totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-black">
                Tokens Used
              </span>
              <span className="text-lg font-black text-amber-400">
                {usage.tokensUsed.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">
            Agent Registry
          </h2>
        </div>
        {agents.length === 0 ? (
          <p className="p-8 text-sm text-gray-500 text-center">No AI agents configured</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Agent", "Voice", "Status", "Created"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {agents.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-white">{row.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-300">{row.voice}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                        row.isActive
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-gray-400 bg-white/5 border-white/10"
                      }`}
                    >
                      {row.isActive ? "ACTIVE" : "PAUSED"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
