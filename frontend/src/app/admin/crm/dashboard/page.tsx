"use client";

import {
  BarChart3, TrendingUp, Users, CreditCard, Target,
  ArrowUpRight, ArrowDownRight, Activity, Building2,
  Phone, Mail, Zap, CheckCircle2, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Link from 'next/link';

const revenueData = [
  { month: 'Oct', revenue: 42000, deals: 18 },
  { month: 'Nov', revenue: 58000, deals: 24 },
  { month: 'Dec', revenue: 51000, deals: 21 },
  { month: 'Jan', revenue: 67000, deals: 29 },
  { month: 'Feb', revenue: 72000, deals: 31 },
  { month: 'Mar', revenue: 89000, deals: 38 },
];

const pipelineData = [
  { stage: 'Lead', count: 142 },
  { stage: 'Qualified', count: 89 },
  { stage: 'Proposal', count: 54 },
  { stage: 'Negotiation', count: 22 },
  { stage: 'Closed Won', count: 38 },
];

export default function AdminCRMDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">CRM Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Sales Performance & Pipeline Intelligence</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Contacts', value: '3,842', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+84', up: true },
          { label: 'Open Deals', value: '127', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '+12', up: true },
          { label: 'Revenue (MTD)', value: '$89K', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+23%', up: true },
          { label: 'Win Rate', value: '34%', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '-2%', up: false },
        ].map(kpi => (
          <div key={kpi.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}><kpi.icon className={`w-4 h-4 ${kpi.color}`} /></div>
              <span className={`text-[10px] font-black flex items-center gap-0.5 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{kpi.trend}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" /> Pipeline Stages
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pipelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff08" />
              <XAxis type="number" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="stage" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Recent Activities', count: 24, icon: Activity, href: '/admin/crm/activities', color: 'text-blue-400' },
          { label: 'Upcoming Tasks', count: 12, icon: CheckCircle2, href: '/admin/crm', color: 'text-emerald-400' },
          { label: 'Overdue Follow-ups', count: 8, icon: Clock, href: '/admin/crm', color: 'text-red-400' },
        ].map(card => (
          <Link key={card.label} href={card.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <card.icon className={`w-6 h-6 ${card.color}`} />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{card.label}</p>
                <p className="text-2xl font-black text-white mt-0.5">{card.count}</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
