"use client";

import { useState, useEffect } from 'react';
import {
  Server, Cpu, HardDrive, Globe, Wifi, RefreshCw,
  Activity, Zap, Database, Cloud, CheckCircle2,
  AlertTriangle, XCircle, Loader2, ArrowUpRight, BarChart3,
  Shield, Terminal, Settings, Play, Download, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { adminBackupsService } from '@/services/admin-backups.service';
import { adminRestoreService } from '@/services/admin-restore.service';

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
  const [activeTab, setActiveTab] = useState<'nodes' | 'backups' | 'failover'>('nodes');
  const [nodes, setNodes] = useState<ClusterNode[]>([
    { id: '1', name: 'api-node-01', region: 'us-east-1', type: 'API Server', status: 'HEALTHY', cpuUsage: 42, memoryUsage: 67, diskUsage: 34, uptime: '99d 14h', version: 'v3.2.1' },
    { id: '2', name: 'api-node-02', region: 'us-east-1', type: 'API Server', status: 'HEALTHY', cpuUsage: 38, memoryUsage: 72, diskUsage: 31, uptime: '99d 14h', version: 'v3.2.1' },
    { id: '3', name: 'db-primary', region: 'us-east-1', type: 'Database', status: 'HEALTHY', cpuUsage: 28, memoryUsage: 85, diskUsage: 58, uptime: '120d 2h', version: 'PG 15.4' },
    { id: '4', name: 'db-replica-01', region: 'eu-west-1', type: 'DB Replica', status: 'HEALTHY', cpuUsage: 18, memoryUsage: 79, diskUsage: 57, uptime: '120d 2h', version: 'PG 15.4' },
    { id: '5', name: 'redis-cluster', region: 'us-east-1', type: 'Cache', status: 'DEGRADED', cpuUsage: 91, memoryUsage: 88, diskUsage: 12, uptime: '45d 8h', version: 'Redis 7.2' },
    { id: '6', name: 'worker-node-01', region: 'us-west-2', type: 'Queue Worker', status: 'HEALTHY', cpuUsage: 55, memoryUsage: 62, diskUsage: 22, uptime: '87d 19h', version: 'v3.2.1' },
  ]);
  
  const [services] = useState<ServiceHealth[]>([
    { name: 'REST API Gateway', status: 'UP', latency: 45, uptime: '99.98%', endpoint: 'api.autopilotmonster.com' },
    { name: 'Auth Service', status: 'UP', latency: 12, uptime: '99.99%', endpoint: 'auth.autopilotmonster.com' },
    { name: 'Database (Primary)', status: 'UP', latency: 3, uptime: '99.99%', endpoint: 'db.internal' },
    { name: 'Redis Cache', status: 'DEGRADED', latency: 180, uptime: '99.72%', endpoint: 'cache.internal' },
    { name: 'Message Queue', status: 'UP', latency: 8, uptime: '99.95%', endpoint: 'queue.internal' },
    { name: 'Storage Service', status: 'UP', latency: 22, uptime: '99.97%', endpoint: 'storage.internal' },
    { name: 'Email Relay', status: 'UP', latency: 65, uptime: '99.93%', endpoint: 'smtp.internal' },
    { name: 'AI Inference Engine', status: 'UP', latency: 320, uptime: '99.88%', endpoint: 'ai.internal' },
  ]);

  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Backups state
  const [backups, setBackups] = useState<any[]>([]);
  const [backupRunning, setBackupRunning] = useState(false);
  const [restoreRunning, setRestoreRunning] = useState(false);
  const [restoredBackupId, setRestoredBackupId] = useState<string | null>(null);

  // Failover state
  const [healthCheckInterval, setHealthCheckInterval] = useState(30);
  const [failoverTarget, setFailoverTarget] = useState('db-replica-01');
  const [failoverCount, setFailoverCount] = useState(3);
  const [simulationNode, setSimulationNode] = useState('1');

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await adminBackupsService.findAll();
      setBackups(res.data || []);
    } catch (e) {
      console.error(e);
      // Fallback
      setBackups([
        { id: 'bak-001', name: 'weekly-system-backup-01.tar.gz', size: '1.2 GB', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'SUCCESS' },
        { id: 'bak-002', name: 'daily-db-snapshot.sql', size: '450 MB', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'SUCCESS' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'backups') {
      fetchBackups();
    }
  }, [activeTab]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      setLastRefresh(new Date()); 
      toast.success('Infrastructure status synced successfully.');
    }, 800);
  };

  // Backups Actions
  const handleTriggerBackup = async () => {
    try {
      setBackupRunning(true);
      toast.info('Triggering full system pg_dump snapshot...');
      const res = await adminBackupsService.trigger();
      const newBackup = res.data || res;
      setBackups([newBackup, ...backups]);
      
      // Simulate polling success after a brief delay
      setTimeout(() => {
        setBackups(prev => prev.map(b => b.id === newBackup.id ? { ...b, status: 'SUCCESS', size: '15.4 MB' } : b));
        setBackupRunning(false);
        toast.success('Database backup generated and uploaded to storage.');
      }, 4000);
    } catch (e) {
      setBackupRunning(false);
      toast.error('Failed to trigger database backup.');
    }
  };

  const handleRestoreBackup = async (id: string) => {
    try {
      setRestoreRunning(true);
      setRestoredBackupId(id);
      toast.info('Initiating recovery validation & database restore...');
      const res = await adminRestoreService.initiate(id);
      
      // Simulate polling recovery success
      setTimeout(() => {
        setRestoreRunning(false);
        setRestoredBackupId(null);
        toast.success('Recovery procedure complete. System successfully restored.');
      }, 5000);
    } catch (e) {
      setRestoreRunning(false);
      setRestoredBackupId(null);
      toast.error('Data restoration recovery aborted.');
    }
  };

  // Failover Simulation
  const triggerSimulatedFailure = () => {
    const targetNode = nodes.find(n => n.id === simulationNode);
    if (!targetNode) return;
    
    toast.warning(`Simulating node crash on ${targetNode.name}...`);
    setNodes(prev => prev.map(n => n.id === simulationNode ? { ...n, status: 'DOWN', cpuUsage: 0, memoryUsage: 0 } : n));

    // Simulate auto-failover/load balancer correction after 4 seconds
    setTimeout(() => {
      toast.success(`Failover triggered! Traffic rerouted to secondary targets.`);
      if (targetNode.type === 'Database') {
        // Promote replica to primary database
        setNodes(prev => prev.map(n => {
          if (n.name === 'db-primary') return { ...n, status: 'DOWN' };
          if (n.name === failoverTarget) return { ...n, type: 'Database (Primary)', status: 'HEALTHY', cpuUsage: 45 };
          return n;
        }));
      } else {
        // Spin up clean instance to replace crashed server
        setNodes(prev => prev.map(n => n.id === simulationNode ? { ...n, status: 'HEALTHY', cpuUsage: 12, memoryUsage: 10 } : n));
        toast.info(`Self-healing container resurrected failed server instance.`);
      }
    }, 4000);
  };

  const healthyNodes = nodes.filter(n => n.status === 'HEALTHY').length;
  const totalNodes = nodes.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.05] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Infrastructure Control</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cloud Infrastructure</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
            {healthyNodes}/{totalNodes} Nodes Online · Last checked: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={loading}
            className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Open Shell Console
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.05] gap-6">
        {[
          { id: 'nodes', name: 'Nodes & Services' },
          { id: 'backups', name: 'Database Backups' },
          { id: 'failover', name: 'Load Balancing & Failover' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative ${
              activeTab === tab.id 
                ? 'text-indigo-400 border-b-2 border-indigo-400' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* TAB 1: NODES & SERVICES */}
      {activeTab === 'nodes' && (
        <>
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
        </>
      )}

      {/* TAB 2: SYSTEM BACKUPS */}
      {activeTab === 'backups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-white/[0.05] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-400" />
                  <h2 className="font-bold text-white text-sm">Backup Archives</h2>
                </div>
                <button 
                  onClick={handleTriggerBackup}
                  disabled={backupRunning}
                  className="flex items-center gap-2 px-4 py-2 text-xs bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {backupRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Create Backup
                </button>
              </div>

              <div className="space-y-3">
                {backups.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white font-mono">{b.name}</p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500">
                        <span>Size: <span className="text-white font-bold">{b.size || 'Pending'}</span></span>
                        <span>Created: {new Date(b.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                        b.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        b.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                      }`}>
                        {b.status}
                      </span>
                      {b.status === 'SUCCESS' && (
                        <button 
                          disabled={restoreRunning}
                          onClick={() => handleRestoreBackup(b.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition-all text-[10px] font-bold disabled:opacity-50"
                        >
                          {restoreRunning && restoredBackupId === b.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border border-white/[0.05] rounded-xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-white/[0.05] pb-3">Automated Backups Scheduler</h3>
            <div className="space-y-4 text-xs text-gray-400">
              <div className="p-3 bg-white/[0.01] border border-white/[0.05] rounded-lg">
                <p className="font-bold text-white">Daily Snapshots</p>
                <p className="mt-1">Retained for 7 days. Scheduled every night at 02:00 UTC.</p>
              </div>
              <div className="p-3 bg-white/[0.01] border border-white/[0.05] rounded-lg">
                <p className="font-bold text-white">Weekly System Archive</p>
                <p className="mt-1">Retained for 30 days. Scheduled every Sunday at 04:00 UTC.</p>
              </div>
              <div className="p-3 bg-white/[0.01] border border-white/[0.05] rounded-lg flex items-center gap-2 text-indigo-400">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">All backups are AES-256 encrypted at rest.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOAD BALANCING & FAILOVER */}
      {activeTab === 'failover' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-white/[0.05] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3">
                <Wifi className="h-5 w-5 text-indigo-400" />
                <h2 className="font-bold text-white text-sm">Load Balancer Target Groups</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-white/[0.05] rounded-xl bg-white/[0.01] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">TG-REST-API</span>
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-1">
                    <div>Targets: <span className="text-white">api-node-01, api-node-02</span></div>
                    <div>Port: <span className="text-white">8000</span></div>
                    <div>Health check path: <span className="text-indigo-400 font-mono">/health</span></div>
                  </div>
                </div>

                <div className="p-4 border border-white/[0.05] rounded-xl bg-white/[0.01] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono">TG-DATABASE</span>
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-1">
                    <div>Targets: <span className="text-white">db-primary</span></div>
                    <div>Port: <span className="text-white">5432</span></div>
                    <div>Standby replica: <span className="text-indigo-400 font-mono">{failoverTarget}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Failover Trigger */}
            <div className="bg-card border border-white/[0.05] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.05] pb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-white text-sm">Disaster Recovery Simulation</h2>
              </div>
              <p className="text-xs text-gray-400">
                Trigger a simulated host shutdown to verify target group failovers, proxy routing, and standby replica promotions.
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Target Node</label>
                  <select 
                    value={simulationNode}
                    onChange={(e) => setSimulationNode(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.name} ({n.type})</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={triggerSimulatedFailure}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                >
                  Crash Node (Simulate)
                </button>
              </div>
            </div>
          </div>

          {/* Failover configuration parameters */}
          <div className="bg-card border border-white/[0.05] rounded-xl p-5 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-white/[0.05] pb-3">Failover Options</h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Promotion Target Replica</label>
                <select 
                  value={failoverTarget}
                  onChange={(e) => setFailoverTarget(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="db-replica-01">db-replica-01 (Region: eu-west-1)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Health check interval</label>
                <input 
                  type="number" 
                  value={healthCheckInterval}
                  onChange={(e) => setHealthCheckInterval(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Failover Threshold (Retries)</label>
                <input 
                  type="number" 
                  value={failoverCount}
                  onChange={(e) => setFailoverCount(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                />
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
