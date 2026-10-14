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
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  user?: { name: string; email: string };
  ipAddress?: string;
  createdAt: string;
}

export default function WorkspaceActivityLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs/audit');
      const json = res.data;
      if (Array.isArray(json)) setLogs(json);
      else if (json.data) setLogs(json.data);
    } catch (e) {
      toast.error('Failed to synchronize audit forensics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
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
              Forensic Feed Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: Audit-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            Workspace Audit Ledger
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Monitor Administrative Dispatches, Policy Divergences & Systemic Integrity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="px-8 py-3 bg-white text-[#0b0f19] rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Audit Archive
          </button>
        </div>
      </div>

      {/* Control Module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
          <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search action artifact, user identity, or entity node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-gray-600 font-medium"
          />
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Entity Vector
          </span>
          <select className="bg-transparent border-none outline-none text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide px-2">
            <option>All Nodes</option>
            <option>Security</option>
            <option>Billing</option>
            <option>CRM Core</option>
          </select>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between group cursor-pointer hover:bg-blue-500/10 transition-all">
          <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wide leading-none">
            Scrub Lattice
          </span>
          <Activity className="w-4 h-4 text-blue-700 dark:text-blue-400 opacity-60" />
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-card rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors" />

            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Terminal className="w-8 h-8 shrink-0" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-card border border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {log.entity || 'SYSTEM'}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-tight truncate">
                    {log.action}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight flex items-center gap-2">
                  <User className="w-3.5 h-3.5 opacity-40 shrink-0" />{' '}
                  {log.user?.name || 'Automated Dispatch'}
                  <span className="opacity-20">•</span>
                  <Globe className="w-3.5 h-3.5 opacity-40 shrink-0" />{' '}
                  {log.ipAddress || '127.0.0.1'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-10 shrink-0 text-right">
              <div className="hidden lg:block">
                <p className="text-xs text-gray-700 font-semibold uppercase tracking-wide mb-0.5">
                  Entity Node
                </p>
                <p className="text-xs text-muted-foreground font-mono italic uppercase">
                  {log.entityId?.substring(0, 12) || 'UNIVERSAL'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide flex items-center gap-2 justify-end">
                  <Clock className="w-4 h-4 opacity-40" />{' '}
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <button className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {logs.length === 0 && !loading && (
          <div className="p-24 text-center space-y-8 bg-card border border-dashed border-border rounded-[60px] transform scale-95 opacity-80">
            <History className="w-20 h-20 text-gray-800 mx-auto opacity-20" />
            <div className="space-y-2">
              <p className="text-xl font-bold text-muted-foreground font-sans uppercase tracking-wide">
                Workspace Silence
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                The audit ledger is currently empty. Administrative actions and systemic dispatches
                will propagate to this feed in real-time.
              </p>
            </div>
            <button
              onClick={fetchLogs}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40"
            >
              Synchronize Forensic Feed
            </button>
          </div>
        )}
      </div>

      {/* Intelligence & Integrity Module */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="p-10 rounded-[60px] bg-card border border-border flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="p-6 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all relative shrink-0">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="space-y-3 relative">
            <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
              Integrity Forensics
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
              Utilize platform-wide integrity checks to verify audit persistence. Detect structural
              divergences in your workspace action artifacts automatically.
            </p>
          </div>
        </div>
        <div className="p-10 rounded-[60px] bg-card border border-border flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
          <div className="p-6 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all relative shrink-0">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <div className="space-y-3 relative">
            <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter font-sans leading-none">
              Divergence Alerts
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
              Monitor unauthorized administrative dispatches. Identify policy non-compliance
              artifacts across your workspace lattice via real-time forensic scanning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
