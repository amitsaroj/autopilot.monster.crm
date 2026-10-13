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
  Megaphone,
  Send,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  BarChart3,
  Clock,
  Edit2,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  Target,
  Rocket,
  PieChart,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  type: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'OMNICHANNEL';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  subject?: string;
  stats?: {
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  scheduledAt?: string;
  createdAt: string;
}

export default function CampaignsManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/campaigns');
      const json = res.data;
      if (json.data) setCampaigns(json.data);
    } catch (e) {
      toast.error('Failed to synchronize outreach artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      DRAFT: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
      PAUSED: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      COMPLETED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${colors[status] || 'bg-card text-muted-foreground border-border'}`}
      >
        {status} Dispatch
      </span>
    );
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />;
      case 'SMS':
        return <Phone className="w-5 h-5 text-amber-700 dark:text-amber-400" />;
      default:
        return <Megaphone className="w-5 h-5 text-blue-500" />;
    }
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
              Outreach Lattice Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Campaign-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Outreach Artifacts
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Multi-Channel Marketing & Dispatch Intelligence
          </p>
        </div>
        <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-500" /> Provision Campaign Node
        </button>
      </div>

      {/* Persistence Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Dispatches',
            value: '1.2M',
            icon: Send,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Open Forensics',
            value: '28.4%',
            icon: Activity,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Fiscal Conversion',
            value: '4.2%',
            icon: TrendingUp,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Active Lattices',
            value: '12',
            icon: Megaphone,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl bg-card border border-border flex items-center gap-6 group hover:bg-white/[0.02] transition-all relative overflow-hidden"
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

      {/* Campaign Ledger */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Outreach Identity
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Channel Node
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Performance Forensics
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
                        {getChannelIcon(camp.type)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                          {camp.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter flex items-center gap-1.5 truncate max-w-[150px]">
                          {camp.subject || 'Automated Outreach Dispatch'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide px-2 py-1 bg-card rounded-md">
                      {camp.type} LATTICE
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          CTR
                        </p>
                        <p className="text-sm font-semibold text-foreground">{camp.stats?.clicked || 0}%</p>
                      </div>
                      <div className="w-px h-6 bg-card" />
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Open
                        </p>
                        <p className="text-sm font-semibold text-foreground">{camp.stats?.opened || 0}%</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(camp.status || 'DRAFT')}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      {camp.status === 'ACTIVE' ? (
                        <button className="p-2.5 rounded-xl bg-card border border-border hover:text-amber-500 transition-all">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="p-2.5 rounded-xl bg-card border border-border hover:text-emerald-500 transition-all">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
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
                      <Rocket className="w-16 h-16 opacity-10" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-muted-foreground font-sans uppercase tracking-wide">
                          No Outreach Artifacts Detected
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          The workspace growth lattice is currently dormant. Provision your first
                          campaign dispatch to begin customer activation.
                        </p>
                      </div>
                      <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
                        Initialize Growth Node
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intelligence & Analytics Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="p-10 rounded-xl bg-card border border-border space-y-8 group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter">
                Campaign Intelligence
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Utilize platform-wide outreach forensics to identify high-performing dispatch windows.
              Analyze artifact sentiment pulse and click-through velocity across all active
              lattices.
            </p>
          </div>
          <div className="pt-8 border-t border-border flex items-center justify-between">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-4 border-[#0b0f19] bg-card flex items-center justify-center text-xs font-semibold text-muted-foreground"
                >
                  {i}
                </div>
              ))}
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide italic animate-pulse">
              Analyzing Engagement Lattices...
            </span>
          </div>
        </div>

        <div className="p-10 rounded-xl bg-blue-600 to-blue-600 text-white space-y-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-6">
            <div className="p-5 rounded-[24px] bg-white/20 backdrop-blur-md border border-border">
              <PieChart className="w-10 h-10 text-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold uppercase tracking-tighter leading-none">
                Fiscal Attribution
              </h3>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide mt-1">
                Status: ROI Tracking Synchronized
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed font-bold uppercase tracking-tight">
            Directly attribute revenue artifacts to specific Outreach dispatches. Track the entire
            fiscal lifecycle from lead-capture to final subscription.
          </p>
          <button className="w-full py-5 bg-card hover:bg-white/20 backdrop-blur-md rounded-2xl text-xs font-semibold uppercase tracking-wide border border-border transition-all">
            Analyze Outcome Metrics
          </button>
        </div>
      </div>
    </div>
  );
}
