'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
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
  GitBranch,
  GitCommit,
  GitPullRequest,
  ArrowDownUp,
  LayoutGrid,
  List,
  Pencil,
  MoreVertical,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  MoveHorizontal,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  order: number;
}

interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStage[];
  _count?: {
    deals: number;
  };
}

export default function PipelinesManagementPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/pipelines');
      const json = res.data;
      if (json.data) setPipelines(json.data);
    } catch (e) {
      toast.error('Failed to synchronize pipeline artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Topology Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Pipeline-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Sales Lifecycles
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Pipelines, Conversion Stages & Lifecycle Probability
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Provision Pipeline
          </button>
        </div>
      </div>

      {/* Persistence Discovery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {pipelines.map((pipeline) => (
          <div
            key={pipeline.id}
            className="p-10 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-card rounded-full blur-3xl group-hover:bg-blue-500/5 transition-colors" />

            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <GitBranch className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                      {pipeline.name}
                    </h3>
                    {pipeline.isDefault && (
                      <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">
                        Master Workflow
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stage Visualizer */}
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    Lifecycle Stages
                  </span>
                  <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide">
                    Topology: {pipeline.stages?.length || 0} States
                  </span>
                </div>
                <div className="space-y-2">
                  {pipeline.stages
                    ?.sort((a, b) => a.order - b.order)
                    .map((stage) => (
                      <div
                        key={stage.id}
                        className="p-4 rounded-2xl bg-black/40 border border-border flex items-center justify-between group/stage cursor-pointer hover:border-white/10 transition-all translate-x-0"
                      >
                        <div className="flex items-center gap-4">
                          <GripVertical className="w-4 h-4 text-gray-800 group-stage-hover:text-gray-600" />
                          <span className="text-xs font-semibold text-foreground uppercase tracking-tighter">
                            {stage.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold tracking-wide">
                            PRB: {stage.probability}%
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-20 group-stage-hover:opacity-100 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all" />
                        </div>
                      </div>
                    ))}
                  <button className="w-full py-3 border border-dashed border-border rounded-2xl text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:border-white/20 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3" /> Append Lifecycle Stage
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">
                  {pipeline._count?.deals || 0}{' '}
                  <span className="text-xs text-muted-foreground uppercase tracking-wide ml-1">
                    Active Deal Vectors
                  </span>
                </span>
              </div>
              <button className="px-6 py-2.5 rounded-xl bg-white text-[#0b0f19] text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl">
                Edit Topology
              </button>
            </div>
          </div>
        ))}

        {/* Provision Placeholder */}
        {pipelines.length < 2 && (
          <div className="p-10 rounded-xl border border-dashed border-border bg-blue-500/[0.01] flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-blue-500/30 transition-all">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-gray-700 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all shrink-0">
              <GitPullRequest className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground uppercase tracking-tighter leading-tight">
                Advanced Lifecycle Architect
              </h3>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed mt-2 uppercase tracking-wide font-semibold opacity-30">
                Persistence Topology: Inactive
              </p>
            </div>
            <button className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2 hover:underline transition-all group-hover:translate-x-1">
              Provision Workflow Archetype <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Global Intelligence Cluster */}
      <div className="p-10 rounded-xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-10 group">
        <div className="flex items-center gap-8">
          <div className="p-6 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <BarChart3 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter">
              Conversion Logistics Forensics
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl font-medium">
              Analyze how deal artifacts transition through your workspace lattice. Define automated
              movement triggers and SLA persistence artifacts for every lifecycle junction.
            </p>
          </div>
        </div>
        <button className="px-8 py-4 bg-card border border-border text-foreground rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all hover:bg-white/[0.1] shrink-0">
          Review Predictive Outcomes
        </button>
      </div>
    </div>
  );
}
