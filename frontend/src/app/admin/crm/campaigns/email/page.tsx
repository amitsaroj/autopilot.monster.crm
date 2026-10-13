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
  Mail,
  Send,
  MousePointer2,
  Eye,
  BarChart3,
  Clock,
  Edit2,
  MoreVertical,
  CheckCircle,
  Target,
  Rocket,
  PieChart,
  FileText,
  LayoutTemplate,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
  scheduledAt?: string;
  createdAt: string;
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/campaigns?type=EMAIL');
      const json = res.data;
      if (json.data) setCampaigns(json.data);
    } catch (e) {
      toast.error('Failed to synchronize email outreach artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      SENT: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      DRAFT: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
      SENDING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${colors[status] || 'bg-card text-muted-foreground border-border'}`}
      >
        {status} Dispatch
      </span>
    );
  };

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
              Email Lattice Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: SMTP-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Email Outreach Artifacts
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Newsletters, Cold Dispatches & Template Persistence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
            <LayoutTemplate className="w-5 h-5" />
          </button>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Provision Email Dispatch
          </button>
        </div>
      </div>

      {/* Analytics Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Dispatch Total',
            value: '428K',
            icon: Send,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Mean Open Rate',
            value: '31.2%',
            icon: Eye,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Mean Click Rate',
            value: '8.4%',
            icon: MousePointer2,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Bounce Forensics',
            value: '0.8%',
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl bg-card border border-border flex items-center gap-6 group hover:bg-white/[0.02] transition-all"
          >
            <div
              className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-foreground uppercase tracking-tighter">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Email Campaign Ledger */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Send invitation
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sent Latency
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Engagement Forensics
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Systemic Status
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">
                  Inspect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                          {camp.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter flex items-center gap-1.5 truncate max-w-[200px]">
                          Sub: {camp.subject}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground uppercase tracking-tighter">
                        {camp.stats?.sent?.toLocaleString() || 0} Artifacts
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                        Timestamp: {new Date(camp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Open
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {camp.stats?.opened || 0}%
                        </p>
                      </div>
                      <div className="w-px h-6 bg-card" />
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          CTR
                        </p>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {camp.stats?.clicked || 0}%
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(camp.status || 'DRAFT')}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      <button className="p-2.5 rounded-xl bg-card border border-border hover:text-foreground dark:hover:text-white hover:bg-white/10 transition-all">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl bg-card border border-border hover:text-blue-400 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl bg-card border border-border hover:text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-6 text-gray-700">
                      <Inbox className="w-16 h-16 opacity-10" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-muted-foreground font-sans uppercase tracking-wide">
                          Lattice Synchronization Empty
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          No email outreach artifacts detected in this workspace cluster. Initialize
                          your first SMTP dispatch to begin tracking engagement vector.
                        </p>
                      </div>
                      <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wide hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                        Initialize Email Dispatch
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template & Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-10 rounded-xl bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter">
              Artifact Blueprints
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Manage high-fidelity email templates. Orchestrate brand identity across all outreach
            dispatches with systemic template persistence.
          </p>
        </div>
        <div className="p-10 rounded-xl bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter">
              AI Content Core
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Leverage AI intelligence to optimize subject line forensics and artifact content.
            Increase engagement pulse with systemic personalization artifacts.
          </p>
        </div>
        <div className="p-10 rounded-xl bg-blue-600 to-blue-600 text-white space-y-4 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Server className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wide leading-tight">
                SMTP Persistence
              </h4>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-tighter italic">
                Status: Delivered Certified
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed font-bold uppercase tracking-tight">
            Email artifacts are dispatched via a distributed SMTP lattice with 99.9% delivery
            persistence and real-time bounce-forensics synchronization.
          </p>
          <button className="w-full py-4 bg-card hover:bg-white/20 backdrop-blur-md rounded-2xl text-xs font-semibold uppercase tracking-wide border border-border transition-all">
            Analyze Delivery Lattices
          </button>
        </div>
      </div>
    </div>
  );
}
