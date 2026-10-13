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
  Users2,
  UserPlus,
  UserCheck,
  Shield,
  Mail,
  MoreVertical,
  Edit2,
  Ban,
  CheckCircle,
  Clock,
  Smartphone,
  Hash,
  ShieldAlert,
  Award,
  Grid,
  List as ListIcon,
  Users as FolderUsers,
  Building2,
  Briefcase,
  Heart,
  MessageSquare,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TeamGroup {
  id: string;
  name: string;
  description: string;
  leaderId?: string;
  members: GroupMember[];
  metadata?: any;
  createdAt: string;
}

export default function TeamGroupsManagementPage() {
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/groups');
      const json = res.data;
      if (json.data) setGroups(json.data);
    } catch (e) {
      toast.error('Failed to synchronize team group artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
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
              Team Lattices Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Group-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Functional Team Orchestration
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Operational Units, Departmental persistence & Group Forensics
          </p>
        </div>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group">
          <Plus className="w-4 h-4" /> Provision Team Group Node
        </button>
      </div>

      {/* Group Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Active Groups',
            value: groups.length,
            icon: FolderUsers,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Unit Engagement',
            value: '88%',
            icon: Target,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Collaboration Pulse',
            value: 'High',
            icon: Activity,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'System Compliance',
            value: 'Verified',
            icon: ShieldCheck,
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
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5 leading-none">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-foreground uppercase tracking-tighter">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Module */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:max-w-md p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search group artifact, description, or leader identity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchGroups}
            className="p-4 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white transition-all shrink-0 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Group Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-10 rounded-[60px] bg-card border border-border hover:border-blue-500/20 transition-all group flex flex-col justify-between relative overflow-hidden h-[450px]"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />

            <div>
              <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-2xl">
                  <Building2 className="w-10 h-10" />
                </div>
                <div className="flex gap-2">
                  <button className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-4 leading-none">
                {group.name || 'Untitled Unit'}
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2 uppercase tracking-wide opacity-80">
                {group.description ||
                  'No functional description provided for this operational node.'}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {group.members.slice(0, 3).map((m, idx) => (
                    <div
                      key={m.id}
                      className="inline-block h-10 w-10 rounded-xl ring-4 ring-[#0b0f19] bg-card flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-400 border border-border uppercase"
                    >
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="inline-block h-10 w-10 rounded-xl ring-4 ring-[#0b0f19] bg-blue-600 flex items-center justify-center text-xs font-semibold text-white border border-border uppercase">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
                <button className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide shrink-0">
                  Propagate Members
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold uppercase tracking-wide">
                  <Users2 className="w-4 h-4 opacity-40 shrink-0" /> {group.members.length}{' '}
                  Identities
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold uppercase tracking-wide">
                  <Briefcase className="w-4 h-4 opacity-40 shrink-0" /> Unit Active
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-5 rounded-2xl bg-card border border-border text-xs font-semibold text-foreground uppercase tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Edit Unit
                </button>
                <button className="p-5 rounded-2xl bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Blueprint Placeholder for New Team Groups */}
        <div className="p-10 rounded-[60px] border border-dashed border-border bg-blue-500/[0.01] flex flex-col items-center justify-center text-center space-y-8 group cursor-pointer hover:border-blue-500/30 transition-all h-[450px]">
          <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center text-gray-700 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all">
            <Plus className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter leading-tight font-sans">
              Initialize Unit
            </h3>
            <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed mt-3 uppercase tracking-wide font-semibold opacity-30">
              Operational Slot: Available
            </p>
          </div>
          <button className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2 hover:underline">
            Deploy Group Dispatch <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persistence Strategy & Resilience Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="p-12 rounded-[60px] bg-card border border-border flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="p-7 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative shrink-0">
            <ShieldCheck className="w-14 h-14" />
          </div>
          <div className="space-y-4 relative">
            <h3 className="text-3xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
              Security Lattices
            </h3>
            <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
              Groups can inherit structural RBAC policies. Enable systemic security dispatches
              across functional unit nodes.
            </p>
          </div>
        </div>
        <div className="p-12 rounded-[60px] bg-card border border-border flex flex-col md:flex-row items-center gap-12 group relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px]" />
          <div className="p-7 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 group-hover:bg-pink-500 group-hover:text-white transition-all relative shrink-0">
            <Heart className="w-14 h-14" />
          </div>
          <div className="space-y-4 relative">
            <h3 className="text-3xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
              Engagement Hub
            </h3>
            <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-80">
              Orchestrate team communication dispatches. Track functional unit synergy and
              collaboration pulse in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
