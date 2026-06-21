"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";
import { parseApiData } from "@/lib/api/parse-response";
import { crmReportService } from "@/services/crm-report.service";

interface CrmSummary {
  totalDeals: number;
  totalRevenue: number;
  totalLeads: number;
  totalContacts: number;
  winRate: number;
}

interface PipelineStage {
  name: string;
  value: number;
  amount: number;
}

interface RevenuePoint {
  name: string;
  revenue: number;
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export default function AdminCRMDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [pipelineData, setPipelineData] = useState<{ stage: string; count: number }[]>([]);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, pipelineRes, revenueRes] = await Promise.all([
          crmReportService.getSummary(),
          crmReportService.getPipeline(),
          crmReportService.getRevenueTrend(),
        ]);
        setSummary(parseApiData<CrmSummary>(summaryRes));
        const pipeline = parseApiData<PipelineStage[]>(pipelineRes) ?? [];
        setPipelineData(pipeline.map((p) => ({ stage: p.name, count: p.value })));
        setRevenueData(parseApiData<RevenuePoint[]>(revenueRes) ?? []);
      } catch {
        toast.error("Failed to load CRM dashboard");
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

  const openDeals = summary
    ? Math.max(0, summary.totalDeals - Math.round((summary.winRate / 100) * summary.totalDeals))
    : 0;

  const kpis = [
    {
      label: "Total Contacts",
      value: (summary?.totalContacts ?? 0).toLocaleString(),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      trend: "",
      up: true,
    },
    {
      label: "Open Deals",
      value: String(openDeals),
      icon: Target,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      trend: "",
      up: true,
    },
    {
      label: "Total Revenue",
      value: formatCurrency(summary?.totalRevenue ?? 0),
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      trend: "",
      up: true,
    },
    {
      label: "Win Rate",
      value: `${Math.round(summary?.winRate ?? 0)}%`,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      trend: "",
      up: (summary?.winRate ?? 0) >= 30,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">CRM Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Sales Performance & Pipeline Intelligence
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              {kpi.trend && (
                <span
                  className={`text-[10px] font-black flex items-center gap-0.5 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}
                >
                  {kpi.up ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {kpi.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              {kpi.label}
            </p>
            <p className="text-2xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Revenue Trend
          </h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-gray-500 py-16 text-center">No revenue data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff20"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff20"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0f19",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Pipeline Stages
          </h2>
          {pipelineData.length === 0 ? (
            <p className="text-sm text-gray-500 py-16 text-center">No pipeline data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff08" />
                <XAxis
                  type="number"
                  stroke="#ffffff20"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="#ffffff20"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b0f19",
                    border: "1px solid #ffffff10",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: "Total Leads",
            count: summary?.totalLeads ?? 0,
            icon: Activity,
            href: "/admin/crm/leads",
            color: "text-blue-400",
          },
          {
            label: "Total Deals",
            count: summary?.totalDeals ?? 0,
            icon: Target,
            href: "/admin/crm/deals",
            color: "text-emerald-400",
          },
          {
            label: "Contacts",
            count: summary?.totalContacts ?? 0,
            icon: Users,
            href: "/admin/crm/contacts",
            color: "text-indigo-400",
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <card.icon className={`w-6 h-6 ${card.color}`} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
                  {card.label}
                </p>
                <p className="text-2xl font-black text-white mt-0.5">{card.count}</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
