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
  Shield,
  History,
  User,
  Clock,
  Terminal,
  Database,
  AlertTriangle,
  FilterX,
  HelpCircle,
  Eye,
  CornerDownRight,
  SquareAsterisk,
  ChevronRight,
  ArrowUpRight,
  ZapOff,
  Rocket,
  Download,
  ArrowDown,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseApiData } from '@/lib/api/parse-response';
import { crmReportService } from '@/services/crm-report.service';

interface PipelineMetric {
  name: string;
  value: number;
  amount: number;
}

export default function PipelineAnalyticsPage() {
  const [metrics, setMetrics] = useState<PipelineMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelineAnalytics = async () => {
    setLoading(true);
    try {
      const res = await crmReportService.getPipeline();
      setMetrics(parseApiData<PipelineMetric[]>(res) ?? []);
    } catch {
      toast.error('Failed to synchronize pipeline conversion forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineAnalytics();
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
              Funnel Forensics Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Pipeline-Conversion-Hub
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tight">Conversion Funnel</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Stage-Velocity & Fiscal Transition Forensics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Funnel Digest
          </button>
        </div>
      </div>

      {/* Funnel Visualizer */}
      <div className="space-y-12 py-10 px-8 rounded-[60px] bg-card border border-border relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {metrics.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground text-center py-16">
              No pipeline data yet
            </p>
          ) : (
            metrics.map((step, idx) => {
              const prevCount = idx > 0 ? metrics[idx - 1].value : step.value;
              const conversionRate =
                prevCount > 0 ? Math.round((step.value / prevCount) * 100) : 100;
              return (
                <div
                  key={step.name}
                  className="flex flex-col items-center group/card transition-all cursor-pointer"
                >
                  <div className="w-full p-8 rounded-xl bg-card border border-border group-hover/card:bg-blue-500/10 group-hover/card:border-blue-500/40 transition-all text-center space-y-4 relative overflow-hidden h-[240px] flex flex-col justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide leading-none group-hover/card:text-blue-400">
                        Stage {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-tighter line-clamp-2">
                        {step.name}
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold text-foreground uppercase tracking-tighter">
                        ${(step.amount / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        {step.value} Opportunity Nodes
                      </p>
                    </div>
                  </div>

                  {idx < metrics.length - 1 && (
                    <div className="md:absolute md:top-1/2 md:right-0 md:-mr-3 md:-translate-y-1/2 flex items-center justify-center p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 flex flex-col items-center justify-center group-hover/card:bg-blue-500 group-hover/card:text-white transition-all shadow-xl">
                        <span className="text-xs font-semibold">{conversionRate}%</span>
                        <ArrowDown className="w-3 h-3 md:rotate-270" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detailed Forensics Table Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 p-10 rounded-[60px] bg-card border border-border relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
                Stage Velocity Intelligence
              </h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">
                Persistence Metric: Mean Resolution Time
              </p>
            </div>
            <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white transition-all group-hover:rotate-180 duration-500">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {metrics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No stage velocity data</p>
            ) : (
              metrics.map((step, idx) => (
                <div
                  key={step.name}
                  className="flex items-center justify-between p-6 rounded-3xl bg-card border border-border group/row hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground font-semibold text-xs group-hover/row:bg-blue-500 group-hover/row:text-white transition-all">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground uppercase tracking-tighter">
                        {step.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        Deals in stage
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                      Deal Count
                    </p>
                    <p className="text-sm font-semibold text-foreground uppercase tracking-tighter">
                      {step.value}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-10 rounded-[60px] bg-card border border-border space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                <ZapOff className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
                  Leakage Forensics
                </h3>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                  Status: Divergence Detected
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              {[
                { label: 'Artifact Abandonment', value: '14%', color: 'bg-red-500' },
                { label: 'Transition Latency', value: '32%', color: 'bg-amber-500' },
                { label: 'Staged Obsolescence', value: '8%', color: 'bg-blue-600' },
              ].map((leak) => (
                <div key={leak.label} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      {leak.label}
                    </span>
                    <span className="text-xs text-foreground font-semibold uppercase tracking-wide">
                      {leak.value}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full ${leak.color} rounded-full`}
                      style={{ width: leak.value }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <h4 className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                Optimized Outcome Prompt
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              "Increase Proposal Dispatch interaction pulse to reduce 14% artifact abandonment rate
              in the fiscal lattice."
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Orchestration Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-10 rounded-[60px] bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-[80px]" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <PieChart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Fiscal Flow analytics
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Monitor how fiscal value artifacts propagate through the workspace pipeline. Orchestrate
            stage-level revenue forecasting with absolute precision.
          </p>
        </div>
        <div className="p-10 rounded-[60px] bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Conversion Velocity
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Analyze the speed of opportunity transition artifacts. Identify structural friction
            points in your conversion funnel and optimize dispatch patterns.
          </p>
        </div>
        <div className="p-10 rounded-[60px] bg-emerald-600 space-y-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-6 relative">
            <div className="p-6 rounded-xl bg-white/20 backdrop-blur-md border border-border">
              <Rocket className="w-10 h-10 text-foreground" />
            </div>
            <div>
              <h3 className="text-3xl font-semibold uppercase text-foreground tracking-tighter leading-none">
                Funnel Seal
              </h3>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide mt-2 px-1">
                Status: Velocity Optimized
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-bold uppercase tracking-tight relative">
            Your workspace funnel transition velocity is currently performing in the top 3% of the
            platform's global cluster benchmarks.
          </p>
          <div className="flex gap-4 relative">
            <button
              onClick={fetchPipelineAnalytics}
              className="flex-1 py-5 bg-white text-[#0b0f19] rounded-3xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              Re-Analyze
            </button>
            <button className="flex-1 py-5 bg-card hover:bg-white/20 backdrop-blur-md text-foreground rounded-3xl text-xs font-semibold uppercase tracking-wide border border-border transition-all">
              Benchmark Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
