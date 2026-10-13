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
  FileText,
  StickyNote,
  Edit3,
  MoreVertical,
  Clock,
  Calendar,
  User,
  Target,
  Building,
  Trash,
  Save,
  Copy,
  Hash,
  MessageSquare,
  Bookmark,
  Lock,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  contact?: { firstName: string; lastName: string };
  deal?: { name: string };
  company?: { name: string };
  createdAt: string;
}

export default function NotesManagementPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/notes');
      const json = res.data;
      if (json.data) setNotes(json.data);
    } catch (e) {
      toast.error('Failed to synchronize knowledge artifacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
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
              Knowledge Lattice Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Internal-Knowledge-Hub
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight text-sans">
            Internal Artifacts
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Orchestrate Notes, Meeting Records & Knowledge Persistence
          </p>
        </div>
        <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-all opacity-60" /> Provision
          Knowledge Artifact
        </button>
      </div>

      {/* Control Module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search knowledge title, content artifact, or associated node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Metadata Type
          </span>
          <select className="bg-transparent border-none outline-none text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">
            <option>All Dispatches</option>
            <option>Meeting Records</option>
            <option>Strategy Docs</option>
            <option>Internal Comms</option>
          </select>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-all">
          <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide leading-none text-center">
            Export Wiki
          </span>
          <Bookmark className="w-4 h-4 text-blue-700 dark:text-blue-400 opacity-60 group-hover:opacity-100 transition-all" />
        </div>
      </div>

      {/* Knowledge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-10 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex flex-col justify-between relative overflow-hidden h-[400px]"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />

            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all uppercase font-semibold text-xl">
                  <StickyNote className="w-6 h-6 shrink-0" />
                </div>
                <div className="flex gap-2 text-gray-700">
                  <button className="p-2 hover:text-foreground dark:hover:text-white transition-all">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 hover:text-foreground dark:hover:text-white transition-all">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-400 transition-colors uppercase tracking-tight mb-4 min-h-[56px] line-clamp-2">
                {note.title || 'Untitled Knowledge Artifact'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 font-medium mb-8 italic opacity-60">
                "
                {note.content ||
                  'System-generated internal artifact recorded for workspace intelligence.'}
                "
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
              <div className="space-y-2">
                {note.contact && (
                  <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground font-bold uppercase tracking-wide leading-none">
                    <User className="w-3.5 h-3.5 text-blue-500 opacity-40 shrink-0" />{' '}
                    {note.contact.firstName} {note.contact.lastName}
                  </div>
                )}
                {note.deal && (
                  <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground font-bold uppercase tracking-wide leading-none">
                    <Target className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 opacity-40 shrink-0" />{' '}
                    {note.deal.name}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 opacity-40" />{' '}
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/10 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-red-400 transition-all">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Blueprint Placeholder */}
        <div className="p-10 rounded-xl border border-dashed border-border bg-blue-500/[0.01] flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:border-blue-500/30 transition-all h-[400px]">
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-gray-700 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-all shadow-inner">
            <Plus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter leading-tight font-sans">
              Draft New Artifact
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto leading-relaxed mt-2 uppercase tracking-wide font-semibold opacity-30">
              Knowledge Persistence Status: Scanning
            </p>
          </div>
          <button className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2 hover:underline transition-all">
            Initialize Knowledge Dispatch <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intelligence & Analytics Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-xl bg-card border border-border flex items-center gap-10 group relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
          <div className="p-6 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative">
            <Hash className="w-12 h-12" />
          </div>
          <div className="space-y-2 relative">
            <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter leading-none">
              Systemic Tagging
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
              Automatically categorize your internal artifacts using AI intelligence. Define global
              taxonomy dispatches to organize the workspace wiki with absolute precision.
            </p>
          </div>
        </div>
        <div className="p-10 rounded-xl bg-card border border-border flex items-center gap-10 group relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="p-6 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all relative">
            <Bookmark className="w-12 h-12" />
          </div>
          <div className="space-y-2 relative">
            <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter leading-none">
              Knowledge Sync
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
              Orchestrate knowledge persistence across your entire workspace cluster. Synchronize
              internal artifacts with relevant contact and deal nodes automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Persistence Policy Ledger */}
      <div className="p-10 rounded-xl border border-dashed border-border bg-card flex flex-col md:flex-row items-center justify-between gap-10 group transition-all">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center text-gray-700 opacity-40 group-hover:opacity-100 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-foreground uppercase tracking-tight mb-1">
              Knowledge Isolation Policy
            </h4>
            <p className="text-sm text-muted-foreground max-w-xl font-medium tracking-tight">
              Internal artifacts are cryptographically isolated within your workspace node.
              Universal dispatches across clusters require explicit 'Administrative Overwrite'
              authentication.
            </p>
          </div>
        </div>
        <button className="px-10 py-5 bg-white text-[#0b0f19] rounded-3xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 shrink-0">
          Compliance Manifest
        </button>
      </div>
    </div>
  );
}
