"use client";

import { useState, useEffect } from 'react';
import { 
  Building2, Users, CreditCard, Activity, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Zap, ShieldAlert, 
  Terminal, Globe, HardDrive, Cpu, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const dummyChartData = [
  { name: 'Mon', revenue: 4000, tenants: 24 },
  { name: 'Tue', revenue: 3000, tenants: 28 },
  { name: 'Wed', revenue: 2000, tenants: 35 },
  { name: 'Thu', revenue: 2780, tenants: 42 },
  { name: 'Fri', revenue: 1890, tenants: 50 },
  { name: 'Sat', revenue: 2390, tenants: 55 },
  { name: 'Sun', revenue: 3490, tenants: 62 },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/v1/admin/metrics/global');
        const json = await res.json();
        if (json.data) setStats(json.data);
      } catch (e) {
        console.error('Failed to fetch global stats', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Control Center</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Global Infrastructure Oversight</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Cluster: North America (Production)</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Platform Revenue', value: `$${stats?.totalRevenue?.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+12.5%' },
          { label: 'Active Tenants', value: stats?.tenants || 0, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-400/10', trend: '+48' },
          { label: 'Total User Profiles', value: stats?.users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+204' },
          { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '+8%' },
        ].map((kpi) => (
          <div key={kpi.label} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all hover:border-indigo-500/20 shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} rounded-full blur-[40px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                <ArrowUpRight className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">{kpi.label}</h3>
            <p className="text-3xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Curve */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" /> Platform Growth Analysis
              </h3>
              <select className="bg-white/5 border border-white/10 text-xs text-gray-400 px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 transition-all">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#white', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* System Health */}
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-2xl space-y-8">
            <h3 className="text-white font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" /> Cluster Resources
            </h3>
            
            <div className="space-y-6">
               {[
                 { label: 'API Processing (CPU)', value: 42, icon: Cpu, color: 'bg-blue-500' },
                 { label: 'Redis/Memory Usage', value: 78, icon: Globe, color: 'bg-purple-500' },
                 { label: 'Entity Storage', value: 24, icon: HardDrive, color: 'bg-indigo-500' },
               ].map((resource) => (
                 <div key={resource.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-xs text-gray-400 font-medium flex items-center gap-2">
                          <resource.icon className="w-3.5 h-3.5" /> {resource.label}
                       </span>
                       <span className="text-xs font-black text-white">{resource.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className={`h-full ${resource.color} rounded-full animate-in slide-in-from-left duration-1000`} style={{ width: `${resource.value}%` }} />
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t border-white/[0.05] space-y-4">
                <div className="flex items-center gap-3">
                   <ShieldAlert className="w-5 h-5 text-red-400" />
                   <div>
                      <p className="text-xs font-bold text-white tracking-tight">Active Anomalies</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black">Cluster Health: Healthy</p>
                   </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition-all uppercase tracking-widest">
                   System Diagnosis
                </button>
            </div>
        </div>
      </div>

      {/* Footer Utility Section */}
      <div className="p-10 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-indigo-500/20 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
               <h3 className="text-xl font-black text-white">Advanced Platform Settings</h3>
               <p className="text-sm text-gray-400 leading-relaxed">
                 Configure global multi-tenant overrides, manage platform-wide feature flags, and orchestrate automated infrastructure backups.
               </p>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 uppercase tracking-widest">
                 <Terminal className="w-4 h-4" /> Global Config
               </button>
               <button className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest">
                 Platform Logs
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
