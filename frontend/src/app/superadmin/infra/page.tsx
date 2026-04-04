"use client";

import { useState, useEffect } from 'react';
import {
  Server, Cpu, HardDrive, Globe, Wifi, RefreshCw,
  Activity, Zap, Database, Cloud, CheckCircle2,
  AlertTriangle, XCircle, Loader2, ArrowUpRight, BarChart3,
  Shield, Terminal, Settings
} from 'lucide-react';
import { toast } from 'sonner';

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
  HEALTHY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  DEGRADED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  DOWN: 'text-red-400 bg-red-500/10 border-red-500/20',
  UP: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const mockNodes: ClusterNode[] = [
  { id: '1', name: 'api-node-01', region: 'us-east-1', type: 'API Server', status: 'HEALTHY', cpuUsage: 42, memoryUsage: 67, diskUsage: 34, uptime: '99d 14h', version: 'v3.2.1' },
  { id: '2', name: 'api-node-02', region: 'us-east-1', type: 'API Server', status: 'HEALTHY', cpuUsage: 38, memoryUsage: 72, diskUsage: 31, uptime: '99d 14h', version: 'v3.2.1' },
  { id: '3', name: 'db-primary', region: 'us-east-1', type: 'Database', status: 'HEALTHY', cpuUsage: 28, memoryUsage: 85, diskUsage: 58, uptime: '120d 2h', version: 'PG 15.4' },
  { id: '4', name: 'db-replica-01', region: 'eu-west-1', type: 'DB Replica', status: 'HEALTHY', cpuUsage: 18, memoryUsage: 79, diskUsage: 57, uptime: '120d 2h', version: 'PG 15.4' },
  { id: '5', name: 'redis-cluster', region: 'us-east-1', type: 'Cache', status: 'DEGRADED', cpuUsage: 91, memoryUsage: 88, diskUsage: 12, uptime: '45d 8h', version: 'Redis 7.2' },
  { id: '6', name: 'worker-node-01', region: 'us-west-2', type: 'Queue Worker', status: 'HEALTHY', cpuUsage: 55, memoryUsage: 62, diskUsage: 22, uptime: '87d 19h', version: 'v3.2.1' },
];

const mockServices: ServiceHealth[] = [
  { name: 'REST API Gateway', status: 'UP', latency: 45, uptime: '99.98%', endpoint: 'api.autopilotmonster.com' },
  { name: 'Auth Service', status: 'UP', latency: 12, uptime: '99.99%', endpoint: 'auth.autopilotmonster.com' },
  { name: 'Database (Primary)', status: 'UP', latency: 3, uptime: '99.99%', endpoint: 'db.internal' },
  { name: 'Redis Cache', status: 'DEGRADED', latency: 180, uptime: '99.72%', endpoint: 'cache.internal' },
  { name: 'Message Queue', status: 'UP', latency: 8, uptime: '99.95%', endpoint: 'queue.internal' },
  { name: 'Storage Service', status: 'UP', latency: 22, uptime: '99.97%', endpoint: 'storage.internal' },
  { name: 'Email Relay', status: 'UP', latency: 65, uptime: '99.93%', endpoint: 'smtp.internal' },
  { name: 'AI Inference Engine', status: 'UP', latency: 320, uptime: '99.88%', endpoint: 'ai.internal' },
];

function UsageBar({ value, color }: { value: number; color: string }) {
  const getColor = () => {
    if (value > 85) return 'bg-red-500';
    if (value > 70) return 'bg-amber-500';
    return color;
  };
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${getColor()} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function CloudOrchestrationPage() {
  const [nodes] = useState<ClusterNode[]>(mockNodes);
  const [services] = useState<ServiceHealth[]>(mockServices);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setLastRefresh(new Date()); }, 1000);
  };

  const healthyNodes = nodes.filter(n => n.status === 'HEALTHY').length;
  const totalNodes = nodes.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Infrastructure Feed</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cloud Infrastructure</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            {healthyNodes}/{totalNodes} Nodes Healthy · Last sync: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={loading}
            className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Open Console
          </button>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Cluster Uptime', value: '99.97%', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+0.02%' },
          { label: 'Avg API Latency', value: '45ms', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '-12ms' },
          { label: 'DB Connections', value: '2,841', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+4%' },
          { label: 'Active Workers', value: '24', icon: Cpu, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'Stable' },
        ].map(kpi => (
          <div key={kpi.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 uppercase tracking-tighter">
                <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Node Grid */}
      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" /> Cluster Nodes
        </h2>
        <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                  {['Node', 'Region', 'Type', 'Status', 'CPU', 'Memory', 'Disk', 'Uptime'].map(h => (
                    <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {nodes.map(node => (
                  <tr key={node.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Server className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-mono">{node.name}</p>
                          <p className="text-[10px] text-gray-600 font-mono">{node.version}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Globe className="w-3 h-3" /> {node.region}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{node.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[node.status]}`}>
                        {node.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>CPU</span><span className="text-white font-black">{node.cpuUsage}%</span>
                        </div>
                        <UsageBar value={node.cpuUsage} color="bg-blue-500" />
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>RAM</span><span className="text-white font-black">{node.memoryUsage}%</span>
                        </div>
                        <UsageBar value={node.memoryUsage} color="bg-purple-500" />
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>Disk</span><span className="text-white font-black">{node.diskUsage}%</span>
                        </div>
                        <UsageBar value={node.diskUsage} color="bg-indigo-500" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-400 font-mono">{node.uptime}</span>
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
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-400" /> Service Health Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(svc => (
            <div key={svc.name} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-2 h-2 rounded-full ${svc.status === 'UP' ? 'bg-emerald-500 animate-pulse' : svc.status === 'DEGRADED' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[svc.status]?.split(' ')[0]}`}>{svc.status}</span>
              </div>
              <h3 className="text-xs font-bold text-white mb-1">{svc.name}</h3>
              <p className="text-[10px] font-mono text-gray-600 mb-3 truncate">{svc.endpoint}</p>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Latency: <span className="text-white font-black">{svc.latency}ms</span></span>
                <span>Up: <span className="text-emerald-400 font-black">{svc.uptime}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
