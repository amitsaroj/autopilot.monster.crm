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
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  BarChart3,
  Clock,
  Edit2,
  MoreVertical,
  Target,
  Rocket,
  PieChart,
  Smartphone,
  ZapOff,
  Lock,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppCampaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  scheduledAt?: string;
  createdAt: string;
}

export default function WhatsAppCampaignsPage() {
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/campaigns?type=WHATSAPP');
      const json = res.data;
      if (json.data) setCampaigns(json.data);
    } catch (e) {
      toast.error('Failed to synchronize WhatsApp outreach artifacts');
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
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-500/20">
              WhatsApp Lattice Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: WABA-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            WhatsApp Outreach Artifacts
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Broadcasts, Interactive Dispatches & Session Forensics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-all opacity-60" /> Provision
            WhatsApp Dispatch
          </button>
        </div>
      </div>

      {/* Real-time Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Dispatch Momentum',
            value: '82K',
            icon: Send,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Read Forensics',
            value: '74.2%',
            icon: CheckCheck,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Interaction Rate',
            value: '18.4%',
            icon: MessageSquare,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Opt-Out Pulse',
            value: '0.4%',
            icon: ZapOff,
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

      {/* WhatsApp Campaign Ledger */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Send invitation
                </th>
                <th className="px-8 py-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sent Momentum
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
                      <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                          {camp.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter flex items-center gap-1.5 truncate max-w-[150px]">
                          ID: {camp.id.substring(0, 12)}...
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
                          Delivered
                        </p>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {camp.stats?.delivered || 0}%
                        </p>
                      </div>
                      <div className="w-px h-6 bg-card" />
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Read
                        </p>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {camp.stats?.read || 0}%
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getStatusBadge(camp.status || 'DRAFT')}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-muted-foreground">
                      <button className="p-2.5 rounded-xl bg-card border border-border hover:text-foreground dark:hover:text-white hover:bg-white/10 transition-all">
                        <Activity className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl bg-card border border-border hover:text-emerald-400 transition-all">
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
                      <Smartphone className="w-16 h-16 opacity-10" />
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-muted-foreground font-sans uppercase tracking-wide">
                          WhatsApp Lattice Dormant
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          No WhatsApp outreach artifacts detected. Initialize your first interactive
                          dispatch to begin tracking read forensics.
                        </p>
                      </div>
                      <button
                        onClick={fetchCampaigns}
                        className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wide hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                      >
                        Initialize WhatsApp Dispatch
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-10 rounded-xl bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all text-center">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Interactive Templates
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Manage high-fidelity WhatsApp Business templates with interactive buttons and media
            artifacts. Orchestrate customer activation with systemic precision.
          </p>
        </div>
        <div className="p-10 rounded-xl bg-card border border-border space-y-6 group hover:bg-white/[0.03] transition-all relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all text-center">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
              Session Intelligence
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            Monitor real-time session forensics. Analyze interaction velocity and response pulse
            across your entire WhatsApp communication lattice.
          </p>
        </div>
        <div className="p-10 rounded-xl bg-emerald-600 to-blue-700 text-white space-y-4 shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-card rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wide leading-tight">
                Secure Lattice
              </h4>
              <p className="text-xs text-foreground/60 font-semibold uppercase tracking-tighter italic">
                Status: E2EE Certified
              </p>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed font-bold uppercase tracking-tight">
            WhatsApp artifacts are dispatched via a cryptographically secure lattice, ensuring
            absolute privacy and 99.9% delivery persistence.
          </p>
          <button className="w-full py-4 bg-card hover:bg-white/20 backdrop-blur-md rounded-2xl text-xs font-semibold uppercase tracking-wide border border-border transition-all">
            Analyze Security Forensics
          </button>
        </div>
      </div>
    </div>
  );
}
