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
  Signal,
  Command,
  Cpu as Processor,
  Workflow,
  ZapOff,
  ArrowUpRight,
  BarChart,
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiLog {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  tenantId?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function PlatformApiPerformancePage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/api-logs');
      const json = res.data;
      if (json.data) setLogs(json.data);
    } catch (e) {
      toast.error('Failed to synchronize API performance dispatches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300)
      return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code >= 400 && code < 500) return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const avgLatency =
    logs.length > 0
      ? (logs.reduce((acc, curr) => acc + curr.durationMs, 0) / logs.length).toFixed(2)
      : 0;
  const errorRate =
    logs.length > 0
      ? ((logs.filter((l) => l.statusCode >= 400).length / logs.length) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Communication Observer Active
            </span>
            <span className="text-xs text-muted-foreground font-mono tracking-tighter uppercase shrink-0 overflow-hidden text-ellipsis max-w-[200px]">
              Node: API-Orchestrator
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">
            API Performance Orchestration
          </h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Monitor Endpoint Latency, Throughput Forensics & Status-Code Persistence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <BarChart className="w-4 h-4" /> Export Performance Archive
          </button>
        </div>
      </div>

      {/* API Intelligence Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Dispatches',
            value: logs.length,
            icon: Workflow,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Avg Latency',
            value: `${avgLatency}ms`,
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Error Divergence',
            value: `${errorRate}%`,
            icon: AlertTriangle,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Throughput Lock',
            value: 'OPTIMAL',
            icon: ShieldCheck,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl bg-card border border-border flex items-center gap-6 group hover:bg-white/[0.02] transition-all relative overflow-hidden"
          >
            <div
              className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-2xl`}
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

      {/* performance Lattice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 p-10 rounded-[60px] bg-card border border-border relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="flex justify-between items-center mb-10 relative">
            <div>
              <h3 className="text-2xl font-semibold text-foreground uppercase tracking-tighter leading-none text-sans">
                Endpoint Dispatches
              </h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-2">
                Real-Time performance Forensics
              </p>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-card border border-border rounded-xl text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="space-y-4 relative max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-6 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-8 flex-1">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-xs ${getStatusColor(log.statusCode)}`}
                  >
                    {log.statusCode}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide border-b border-blue-500/20 pb-0.5">
                        {log.method}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-tight truncate">
                        {log.url}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono italic flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 opacity-40 shrink-0" />{' '}
                      {log.ipAddress || '0.0.0.0'}
                      <span className="opacity-20">•</span>
                      <Layers className="w-3.5 h-3.5 opacity-40 shrink-0" />{' '}
                      {log.tenantId?.substring(0, 8) || 'GLOBAL'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-700 font-semibold uppercase tracking-wide leading-none">
                      Latency
                    </p>
                    <p
                      className={`text-lg font-semibold tracking-tighter ${log.durationMs > 200 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}
                    >
                      {log.durationMs}ms
                    </p>
                  </div>
                  <button className="p-3 rounded-xl bg-card border border-border text-gray-700 hover:text-foreground dark:hover:text-white transition-all shrink-0">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="py-32 text-center space-y-6 opacity-40">
                <Signal className="w-20 h-20 text-gray-800 mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  No API Dispatches Captured
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="p-10 rounded-[60px] bg-card border border-border relative overflow-hidden group shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="flex items-center gap-6 mb-10 relative">
              <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-2xl">
                <Signal className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
                Endpoint Pulse
              </h3>
            </div>
            <div className="space-y-8 relative px-2">
              {[
                { label: 'Auth Dispatches', count: '1,422', stress: 15 },
                { label: 'CRM LATTICE_WRITE', count: '4,891', stress: 82 },
                { label: 'Storage Persistence', count: '2,110', stress: 45 },
                { label: 'Support TICKETS', count: '542', stress: 12 },
              ].map((ep) => (
                <div key={ep.label} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      {ep.label}
                    </span>
                    <span className="text-[11px] text-foreground font-semibold uppercase tracking-wide">
                      {ep.count}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ep.stress > 80 ? 'bg-red-500' : 'bg-blue-600'} rounded-full transition-all duration-1000`}
                      style={{ width: `${ep.stress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[60px] bg-card border border-border relative overflow-hidden group shadow-2xl flex flex-col justify-between h-[340px]">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="space-y-6 relative">
              <div className="flex items-center gap-6">
                <div className="p-5 rounded-3xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Terminal className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter text-sans leading-none">
                  Performance Policy
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed uppercase tracking-tight opacity-80 pt-2">
                Platform-wide latency threshold is set to{' '}
                <span className="text-foreground font-semibold">200ms</span>. Systemic rebalancing
                dispatches initialize automatically upon policy-divergence.
              </p>
            </div>
            <button className="w-full py-5 bg-white text-[#0b0f19] rounded-3xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20 relative">
              Initialize policy Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
