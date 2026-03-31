'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Activity, 
  Users, 
  Zap,
  ArrowRight,
  BarChart3,
  Puzzle,
  Bell,
  Settings,
  Terminal,
  FileSearch,
  Server,
  Clock
} from 'lucide-react';
import { adminMetricsService } from '@/services/admin-metrics.service';
import { adminEnvironmentService } from '@/services/admin-environment.service';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [envData, setEnvData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsRes, envRes] = await Promise.all([
        adminMetricsService.getStats(),
        adminEnvironmentService.getEnv()
      ]);
      setStats(metricsRes.data);
      setEnvData(envRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { label: 'Tenants', href: '/superadmin/tenants', icon: Building2, desc: 'Manage sub-accounts & isolation' },
    { label: 'Marketplace', href: '/superadmin/marketplace', icon: Puzzle, desc: 'Global extension ecosystem' },
    { label: 'Billing', href: '/superadmin/subscriptions', icon: CreditCard, desc: 'Subscription & Revenue control' },
    { label: 'Telemetry', href: '/superadmin/metrics', icon: Activity, desc: 'Real-time system health' },
    { label: 'Forensics', href: '/superadmin/logs/audit', icon: FileSearch, desc: 'Immutable audit trails' },
    { label: 'Broadcasts', href: '/superadmin/notifications', icon: Bell, desc: 'Platform-wide announcements' },
    { label: 'Protocols', href: '/superadmin/events', icon: Terminal, desc: 'Domain event registry' },
    { label: 'Global Config', href: '/superadmin/settings', icon: Settings, desc: 'L7 platform orchestration' },
  ];

  const quickStats = [
    { label: 'Global Tenants', value: stats?.tenants || '0', icon: Building2, color: 'text-blue-500' },
    { label: 'System Uptime', value: envData ? `${Math.floor(envData.uptime / 3600)}h ${Math.floor((envData.uptime % 3600) / 60)}m` : '...', icon: Clock, color: 'text-purple-500' },
    { label: 'Contract Volume', value: stats?.activeSubscriptions || '0', icon: CreditCard, color: 'text-emerald-500' },
    { label: 'Gross Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: Zap, color: 'text-brand' },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-8">
        <div>
          <h1 className="page-title font-black text-4xl tracking-tighter">SuperAdmin Terminal</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">Platform Orchestration / L7 Hierarchy Control</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">Master Node: Operational</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="p-8 rounded-3xl border border-border/30 bg-card/20 backdrop-blur-xl group hover:border-brand/40 transition-all shadow-xl shadow-black/5 overflow-hidden relative">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="h-24 w-24" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">{stat.label}</p>
             <h3 className="text-3xl font-black tracking-tighter group-hover:text-brand transition-colors">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Control Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="group p-6 rounded-3xl border border-border/30 bg-card/10 backdrop-blur-md hover:bg-card/30 transition-all relative overflow-hidden"
            >
               <div className="p-3 rounded-2xl bg-muted/30 text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand inline-flex mb-4 transition-colors">
                  <item.icon className="h-6 w-6" />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  {item.label}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand" />
               </h4>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.desc}
               </p>
            </Link>
         ))}
      </div>

      {/* System Pulse */}
      <div className="rounded-3xl border border-border/30 bg-card/20 backdrop-blur-xl p-10 shadow-2xl relative overflow-hidden border-l-8 border-l-brand">
         <div className="flex flex-col lg:flex-row gap-10 items-center justify-between relative z-10">
            <div className="space-y-4 max-w-xl text-center lg:text-left">
               <h2 className="text-2xl font-black tracking-tighter flex items-center justify-center lg:justify-start gap-3">
                  <Server className="h-7 w-7 text-brand" />
                  Infrastructure Saturation
               </h2>
               <p className="text-xs font-medium text-muted-foreground leading-relaxed uppercase tracking-widest opacity-80">
                  Global cluster resource allocation is currently optimized. Distributed databases are synchronized across 6 availability zones. No hardware alerts detected in the primary region.
               </p>
               <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">PostgreSQL: Operational</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Redis: Operational</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">Qdrant: Operational</span>
               </div>
            </div>
            <div className="w-full lg:w-96 p-8 rounded-3xl bg-muted/20 border border-border/20 text-center">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-6">Load Distibution</h3>
               <div className="flex items-end justify-center gap-4 h-32">
                  {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                    <div key={i} className="w-6 bg-brand rounded-full transition-all hover:scale-110" style={{ height: `${h}%`, opacity: h / 100 }} />
                  ))}
               </div>
               <p className="text-[9px] font-black uppercase tracking-widest text-brand mt-6">Protocol Latency: 12ms</p>
            </div>
         </div>
      </div>
    </div>
  );
}
