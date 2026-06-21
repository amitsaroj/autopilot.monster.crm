"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  ArrowUpRight,
  Activity,
  Zap,
  CreditCard,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

interface LeadFunnel {
  name: string;
  count: number;
}

interface RevenuePoint {
  name: string;
  revenue: number;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];

const REPORT_CATALOG = [
  { id: "summary", name: "CRM Summary", type: "OVERVIEW" },
  { id: "pipeline", name: "Pipeline Distribution", type: "PIPELINE" },
  { id: "revenue-trend", name: "Revenue Trend", type: "REVENUE" },
  { id: "lead-funnel", name: "Lead Conversion Funnel", type: "LEADS" },
  { id: "performance", name: "Agent Performance", type: "ACTIVITY" },
];

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export default function AdminCRMReportsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [funnelData, setFunnelData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, revenueRes, funnelRes] = await Promise.all([
          crmReportService.getSummary(),
          crmReportService.getRevenueTrend(),
          crmReportService.getLeadFunnel(),
        ]);
        setSummary(parseApiData<CrmSummary>(summaryRes));
        setRevenueData(parseApiData<RevenuePoint[]>(revenueRes) ?? []);
        const funnel = parseApiData<LeadFunnel[]>(funnelRes) ?? [];
        const total = funnel.reduce((sum, f) => sum + f.count, 0) || 1;
        setFunnelData(
          funnel.map((f) => ({
            name: f.name,
            value: Math.round((f.count / total) * 100),
          })),
        );
      } catch {
        toast.error("Failed to load CRM reports");
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

  const kpis = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary?.totalRevenue ?? 0),
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Deals",
      value: String(summary?.totalDeals ?? 0),
      icon: Target,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Leads",
      value: String(summary?.totalLeads ?? 0),
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Win Rate",
      value: `${Math.round(summary?.winRate ?? 0)}%`,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Reports</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            Sales & Pipeline Intelligence
          </p>
        </div>
        <button className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
          >
            <div className={`p-2.5 rounded-xl ${kpi.bg} w-fit mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
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
            <Activity className="w-4 h-4 text-indigo-400" /> Revenue Over Time
          </h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-gray-500 py-16 text-center">No revenue data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
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
                  fill="url(#revGrad2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Lead Funnel
          </h2>
          {funnelData.length === 0 ? (
            <p className="text-sm text-gray-500 py-16 text-center">No funnel data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {funnelData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      border: "1px solid #ffffff10",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(v) => [`${Number(v)}%`, "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {funnelData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-gray-400">{s.name}</span>
                    </div>
                    <span className="text-white font-black">{s.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">
          Available Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_CATALOG.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                  <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{r.name}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest">{r.type}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase">
                <ArrowUpRight className="w-3 h-3" /> Live
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
