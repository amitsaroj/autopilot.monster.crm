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
  UserPlus,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Rocket,
  MousePointer2,
  Globe2,
  Mail,
  MessageSquare,
  Phone,
  ZapOff,
  Lock,
  User,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseApiData } from '@/lib/api/parse-response';
import { crmReportService } from '@/services/crm-report.service';

interface LeadFunnelPoint {
  name: string;
  count: number;
}

export default function LeadAnalyticsPage() {
  const [metrics, setMetrics] = useState<LeadFunnelPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await crmReportService.getLeadFunnel();
      setMetrics(parseApiData<LeadFunnelPoint[]>(res) ?? []);
    } catch {
      toast.error('Failed to synchronize lead funnel forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadAnalytics();
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
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
              Acquisition Forensics Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Lead-Funnel-Hub
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">Growth Funnel</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Source-Attribution & Transition Forensics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchLeadAnalytics}
            className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Growth Digest
          </button>
        </div>
      </div>

      {/* Core Funnel Forensics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: 'New Leads',
            value: '4.2k',
            trend: '+14.2%',
            icon: UserPlus,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Net Conversion',
            value: '1,280',
            trend: '+8.4%',
            icon: UserCheck,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Mean Quality',
            value: '8.4/10',
            trend: '+1.2%',
            icon: Star,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'CAC Artifact',
            value: '$12.4',
            trend: '-2.4%',
            icon: Target,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-8 rounded-xl bg-card border border-border group hover:bg-white/[0.03] transition-all relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1 opacity-60 leading-none">
              {stat.label}
            </p>
            <h3 className="text-3xl font-semibold text-foreground uppercase tracking-tighter mb-4">
              {stat.value}
            </h3>
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${stat.trend.startsWith('+') ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-500'}`}
            >
              <stat.icon className={`w-3.5 h-3.5 ${stat.color} opacity-40`} /> {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Source Attribution Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 p-10 rounded-[60px] bg-card border border-border relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
                Source Attribution Intelligence
              </h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2 px-1">
                Acquisition Persistence: Synchronized
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {metrics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No lead funnel data yet
              </p>
            ) : (
              metrics.map((m, idx) => {
                const total = metrics.reduce((sum, item) => sum + item.count, 0) || 1;
                const share = Math.round((m.count / total) * 100);
                return (
                  <div
                    key={m.name}
                    className="p-6 rounded-xl bg-card border border-border hover:bg-white/[0.03] transition-all group/row flex items-center justify-between gap-10 cursor-pointer"
                  >
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover/row:bg-blue-500 group-hover/row:text-white transition-all">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-tighter truncate">
                          {m.name}
                        </h4>
                        <div className="h-1 w-full bg-card rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-12 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5 whitespace-nowrap">
                          Leads
                        </p>
                        <p className="text-sm font-semibold text-foreground uppercase tracking-tighter">
                          {m.count.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5 whitespace-nowrap">
                          Share
                        </p>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">
                          {share}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-10 rounded-[60px] bg-card border border-border space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <TrendingUp className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
                  Funnel Efficiency forensics
                </h3>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                  Status: High-Velocity Growth
                </p>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              {[
                { label: 'Lead Capture Velocity', value: '42s', desc: 'Acquisition Latency' },
                { label: 'Transition Rate', value: '62.4%', desc: 'Lead-to-Contact Pulse' },
                { label: 'Retention Persistence', value: '88.2%', desc: 'Growth Stability' },
              ].map((eff) => (
                <div
                  key={eff.label}
                  className="space-y-1 flex justify-between items-end border-b border-border pb-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      {eff.label}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium tracking-tight uppercase">
                      {eff.desc}
                    </p>
                  </div>
                  <p className="text-2xl font-semibold text-foreground uppercase tracking-tighter">
                    {eff.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-5 bg-white text-[#0b0f19] rounded-3xl text-xs font-semibold uppercase tracking-wide transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20">
            Orchestrate Growth Nodes
          </button>
        </div>
      </div>

      {/* Intelligence & Strategy Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-10 rounded-[60px] bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-[80px]" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Demographic Pulse
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Analyze lead identity artifacts across global regional clusters. Identify high-growth
            demographic sectors for strategic growth orchestration.
          </p>
        </div>
        <div className="p-10 rounded-[60px] bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Anomaly Forensics
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Monitor acquisition structural deviations and bot-artifact detection. Automatically flag
            structural anomalies in your growth funnel persistence.
          </p>
        </div>
        <div className="p-10 rounded-[60px] bg-card border border-dashed border-border space-y-8 flex flex-col justify-center text-center group transition-all">
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-gray-700 mx-auto group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
            <Rocket className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter leading-none">
              Growth Strategy Optimizer
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed mt-2 uppercase tracking-wide font-semibold opacity-30 px-4">
              Identify and Scale High-Velocity Acquisition Artifacts
            </p>
          </div>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all hover:bg-blue-700 shadow-xl shadow-blue-500/20">
            Initialize Optimizer
          </button>
        </div>
      </div>
    </div>
  );
}
