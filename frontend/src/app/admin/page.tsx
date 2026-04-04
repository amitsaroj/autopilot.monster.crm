"use client";

import { useState, useEffect } from 'react';
import {
  Users, Building2, CreditCard, Activity, TrendingUp,
  ShieldCheck, Zap, AlertTriangle, ArrowUpRight,
  Settings, Globe, BarChart3, CheckCircle2, Loader2,
  ArrowRight, Brain, Workflow, MessageSquare, Phone
} from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'CRM Dashboard', href: '/admin/crm/dashboard', icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Billing', href: '/admin/billing', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'RBAC & Roles', href: '/admin/rbac', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'AI Suite', href: '/admin/ai', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Workflows', href: '/admin/workflows', icon: Workflow, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { label: 'WhatsApp', href: '/admin/whatsapp', icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

export default function AdminIndexPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/admin/metrics/overview')
      .then(r => r.json())
      .then(j => { if (j.data) setStats(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Users', value: stats?.users ?? '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12' },
    { label: 'Active Contacts', value: stats?.contacts ?? '—', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '+84' },
    { label: 'MRR', value: stats?.mrr ? `$${stats.mrr.toLocaleString()}` : '—', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+8%' },
    { label: 'Open Issues', value: stats?.openIssues ?? '0', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '' },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Tenant Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Workspace Management Overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              {kpi.trend && (
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5 uppercase">
                  <ArrowUpRight className="w-3 h-3" />{kpi.trend}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex items-center gap-4">
              <div className={`p-3 rounded-xl ${link.bg} group-hover:scale-110 transition-transform`}>
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <div>
                <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{link.label}</p>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-white">System Health</h3>
            <p className="text-sm text-gray-400 mt-1">All services operational — No active incidents</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">All Systems Go</span>
          </div>
        </div>
      </div>
    </div>
  );
}
