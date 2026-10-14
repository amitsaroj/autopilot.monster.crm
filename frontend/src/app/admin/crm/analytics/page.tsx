'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Settings,
  Trash2,
  Globe,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Activity,
  Server,
  Cpu,
  Layout,
  ExternalLink,
  Package,
  Zap,
  Download,
  Star,
  Users,
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  PieChart,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MousePointer2,
  UserPlus,
  ZapOff,
  Rocket,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseApiData } from '@/lib/api/parse-response';
import { crmReportService } from '@/services/crm-report.service';
import { analyticsService } from '@/services/analytics.service';

interface CrmSummary {
  totalDeals: number;
  totalRevenue: number;
  totalLeads: number;
  totalContacts: number;
  winRate: number;
}

interface RevenuePoint {
  name: string;
  revenue: number;
}

interface LeadFunnelPoint {
  name: string;
  count: number;
}

export default function CRMAnalyticsSummaryPage() {
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [funnelData, setFunnelData] = useState<LeadFunnelPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, revenueRes, funnelRes, crmAnalytics] = await Promise.all([
        crmReportService.getSummary(),
        crmReportService.getRevenueTrend(),
        crmReportService.getLeadFunnel(),
        analyticsService.getCrm(),
      ]);
      setSummary(parseApiData<CrmSummary>(summaryRes));
      setRevenueData(parseApiData<RevenuePoint[]>(revenueRes) ?? []);
      setFunnelData(parseApiData<LeadFunnelPoint[]>(funnelRes) ?? []);
      if (!parseApiData<CrmSummary>(summaryRes) && crmAnalytics) {
        setSummary({
          totalContacts: crmAnalytics.contacts,
          totalLeads: crmAnalytics.leads,
          totalDeals: crmAnalytics.deals,
          totalRevenue: 0,
          winRate: crmAnalytics.conversionRate,
        });
      }
    } catch {
      toast.error('Failed to synchronize CRM performance forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Forensic Engine Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Analytic-Core
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">
            Performance Summary
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Data Visuals & Strategic Fiscal Intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-card border border-border p-1 rounded-2xl">
            <button className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold uppercase tracking-wide shadow-xl shadow-blue-500/20 transition-all">
              Real-time
            </button>
            <button className="px-5 py-2 rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white text-xs font-semibold uppercase tracking-wide transition-all">
              7 Days
            </button>
            <button className="px-5 py-2 rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white text-xs font-semibold uppercase tracking-wide transition-all">
              30 Days
            </button>
          </div>
          <button className="p-3 bg-white text-[#0b0f19] rounded-xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Persistence Forensics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: 'Total Leads',
            value: (summary?.totalLeads ?? 0).toLocaleString(),
            trend: '',
            icon: UserPlus,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Fiscal Pipeline',
            value: `$${Math.round((summary?.totalRevenue ?? 0) / 1000)}K`,
            trend: '',
            icon: DollarSign,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Conversion Pulse',
            value: `${Math.round(summary?.winRate ?? 0)}%`,
            trend: '',
            icon: Target,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Total Contacts',
            value: (summary?.totalContacts ?? 0).toLocaleString(),
            trend: '',
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-8 rounded-xl bg-card border border-border group hover:bg-white/[0.03] transition-all relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />
            <div className="flex justify-between items-start mb-6">
              <div
                className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-8 h-8" />
              </div>
              <div
                className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${stat.trend.startsWith('+') ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-500'}`}
              >
                {stat.trend}{' '}
                {stat.trend.startsWith('+') ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1 opacity-60 leading-none">
              {stat.label}
            </p>
            <h3 className="text-3xl font-semibold text-foreground uppercase tracking-tighter">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Main Forensic Chart Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 p-10 rounded-[60px] bg-card border border-border relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
                Revenue Trajectory artifact
              </h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">
                Fiscal Persistence: Synchronized
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                <div className="w-2 h-2 rounded-full bg-blue-600" /> Projected
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                <div className="w-2 h-2 rounded-full bg-white/20" /> Historical
              </div>
            </div>
          </div>
          {/* Revenue chart from live API */}
          <div className="h-[300px] w-full flex items-end gap-3 px-4">
            {(revenueData.length > 0 ? revenueData : []).map((point, i) => {
              const maxRevenue = Math.max(...revenueData.map((p) => p.revenue), 1);
              const height = Math.round((point.revenue / maxRevenue) * 100);
              return (
                <div key={point.name} className="flex-1 space-y-2 group/bar">
                  <div className="h-[250px] w-full flex items-end">
                    <div
                      style={{ height: `${height}%` }}
                      className="w-full bg-card border border-border rounded-2xl group-hover/bar:bg-blue-500 group-hover/bar:border-blue-400 group-hover/bar:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer relative"
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity px-3 py-1 bg-white text-[#0b0f19] rounded-lg text-xs font-semibold uppercase whitespace-nowrap">
                        {point.name}: ${(point.revenue / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                  <p className="text-[8px] text-gray-700 font-semibold text-center uppercase tracking-tighter">
                    {point.name}
                  </p>
                </div>
              );
            })}
            {revenueData.length === 0 && (
              <p className="text-sm text-muted-foreground w-full text-center py-16">
                No revenue data yet
              </p>
            )}
          </div>
        </div>

        <div className="p-10 rounded-[60px] bg-card border border-border space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <PieChart className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
                  Channel Mix forensics
                </h3>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                  Status: Active Analysis
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              {(funnelData.length > 0 ? funnelData : []).map((mix) => {
                const total = funnelData.reduce((sum, f) => sum + f.count, 0) || 1;
                const pct = Math.round((mix.count / total) * 100);
                const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-white/20'];
                const color = colors[funnelData.indexOf(mix) % colors.length];
                return (
                  <div key={mix.name} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        {mix.name}
                      </span>
                      <span className="text-xs text-foreground font-semibold uppercase tracking-wide">
                        {pct}% ({mix.count})
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {funnelData.length === 0 && (
                <p className="text-sm text-muted-foreground">No lead funnel data</p>
              )}
            </div>
          </div>

          <button className="w-full py-5 bg-card border border-border hover:bg-white/[0.08] text-foreground rounded-3xl text-xs font-semibold uppercase tracking-wide transition-all">
            Deep-Dive Mix Analysis
          </button>
        </div>
      </div>

      {/* Intelligence & Prediction Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-10 rounded-[60px] bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-[80px]" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Velocity Predictor
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Utilize platform-wide predictive forensics to forecast lead transition velocity and deal
            closure probability artifacts for the next fiscal phase.
          </p>
        </div>
        <div className="p-10 rounded-[60px] bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Anomoly Forensics
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Monitor lead funnel leakage and communication latency artifacts in real-time.
            Automatically flag structural performance deviations in your growth lattice.
          </p>
        </div>
        <div className="p-10 rounded-[60px] bg-blue-600 to-blue-800 text-white space-y-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-6">
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-md border border-border">
              <Rocket className="w-10 h-10 text-foreground" />
            </div>
            <div>
              <h3 className="text-3xl font-semibold uppercase tracking-tighter leading-none">
                Strategic Pulse
              </h3>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide mt-2">
                Status: Optimized Growth
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed font-bold uppercase tracking-tight">
            Your workspace performance artifacts are currently performing in the top 5% of the
            platform's global cluster analysis.
          </p>
          <div className="flex gap-4">
            <button className="flex-1 py-5 bg-white text-[#0b0f19] rounded-3xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-2xl">
              Full Audit
            </button>
            <button className="flex-1 py-5 bg-card hover:bg-white/20 backdrop-blur-md rounded-3xl text-xs font-semibold uppercase tracking-wide border border-border transition-all">
              Benchmarks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
