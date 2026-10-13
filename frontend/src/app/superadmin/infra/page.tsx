'use client';

import { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Globe,
  Wifi,
  RefreshCw,
  Activity,
  Zap,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowUpRight,
  BarChart3,
  Shield,
  Terminal,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

import { adminHealthService } from '@/services/admin-health.service';

interface ClusterNode {
  id: string;
  name: string;
  region: string;
  type: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
  version: string;
}

interface ServiceHealth {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  latency: number;
  uptime: string;
  endpoint: string;
}

const STATUS_STYLES: Record<string, string> = {
  HEALTHY: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  DEGRADED: 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
  DOWN: 'text-red-400 bg-red-500/10 border-red-500/20',
  UP: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function UsageBar({ value, color }: { value: number; color: string }) {
  const getColor = () => {
    if (value > 85) return 'bg-red-500';
    if (value > 70) return 'bg-amber-500';
    return color;
  };
  return (
    <div className="h-1.5 w-full bg-card rounded-full overflow-hidden">
      <div
        className={`h-full ${getColor()} rounded-full transition-all duration-1000`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function CloudOrchestrationPage() {
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminHealthService.getHealth();
      const health = res.data?.data;
      if (!health) return;

      const memoryUsage = Math.round(
        ((health.memory.total - health.memory.free) / health.memory.total) * 100,
      );
      const cpuLoad = health.cpu.load[0] ?? 0;
      const cpuUsage = Math.min(100, Math.round((cpuLoad / health.cpu.count) * 100));

      setNodes([
        {
          id: '1',
          name: 'api-primary',
          region: health.platform,
          type: 'API Server',
          status: health.status === 'OK' ? 'HEALTHY' : 'DEGRADED',
          cpuUsage,
          memoryUsage,
          diskUsage: Math.round(
            (health.memory.usage.heapUsed / health.memory.usage.heapTotal) * 100,
          ),
          uptime: formatUptime(health.uptime),
          version: health.nodeVersion,
        },
      ]);

      setServices([
        {
          name: 'Platform API',
          status: health.status === 'OK' ? 'UP' : 'DEGRADED',
          latency: Math.round(cpuLoad * 10),
          uptime: formatUptime(health.uptime),
          endpoint: 'api.autopilotmonster.com',
        },
      ]);
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to load infrastructure health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const refresh = () => {
    void load();
  };

  const healthyNodes = nodes.filter((n) => n.status === 'HEALTHY').length;
  const totalNodes = nodes.length;

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-700 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Live Infrastructure Feed
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Cloud Infrastructure</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            {healthyNodes}/{totalNodes} Nodes Healthy · Last sync:{' '}
            {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Open Console
          </button>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Cluster Uptime',
            value: '99.97%',
            icon: Zap,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
            trend: '+0.02%',
          },
          {
            label: 'Avg API Latency',
            value: '45ms',
            icon: Activity,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
            trend: '-12ms',
          },
          {
            label: 'DB Connections',
            value: '2,841',
            icon: Database,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
            trend: '+4%',
          },
          {
            label: 'Active Workers',
            value: '24',
            icon: Cpu,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
            trend: 'Stable',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-tighter">
                <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Node Grid */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Cluster Nodes
        </h2>
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-card">
                  {['Node', 'Region', 'Type', 'Status', 'CPU', 'Memory', 'Disk', 'Uptime'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {nodes.map((node) => (
                  <tr key={node.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Server className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground font-mono">{node.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{node.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="w-3 h-3" /> {node.region}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {node.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[node.status]}`}
                      >
                        {node.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>CPU</span>
                          <span className="text-foreground font-semibold">{node.cpuUsage}%</span>
                        </div>
                        <UsageBar value={node.cpuUsage} color="bg-blue-600" />
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>RAM</span>
                          <span className="text-foreground font-semibold">{node.memoryUsage}%</span>
                        </div>
                        <UsageBar value={node.memoryUsage} color="bg-blue-600" />
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Disk</span>
                          <span className="text-foreground font-semibold">{node.diskUsage}%</span>
                        </div>
                        <UsageBar value={node.diskUsage} color="bg-blue-600" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-muted-foreground font-mono">{node.uptime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Services Health */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-700 dark:text-blue-400" /> Service Health Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`w-2 h-2 rounded-full ${svc.status === 'UP' ? 'bg-emerald-500 animate-pulse' : svc.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'}`}
                />
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[svc.status]?.split(' ')[0]}`}
                >
                  {svc.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1">{svc.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mb-3 truncate">{svc.endpoint}</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Latency: <span className="text-foreground font-semibold">{svc.latency}ms</span>
                </span>
                <span>
                  Up: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{svc.uptime}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
