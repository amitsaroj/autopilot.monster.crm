"use client";

import { useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Target, Download,
  Calendar, ArrowUpRight, ArrowDownRight, Filter,
  CreditCard, Activity, Zap, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const monthlyData = [
  { month: 'Oct', deals: 18, leads: 92, revenue: 42000 },
  { month: 'Nov', deals: 24, leads: 118, revenue: 58000 },
  { month: 'Dec', deals: 21, leads: 104, revenue: 51000 },
  { month: 'Jan', deals: 29, leads: 145, revenue: 67000 },
  { month: 'Feb', deals: 31, leads: 158, revenue: 72000 },
  { month: 'Mar', deals: 38, leads: 192, revenue: 89000 },
];

const sourceData = [
  { name: 'Website', value: 38 },
  { name: 'Referral', value: 24 },
  { name: 'Cold Outreach', value: 18 },
  { name: 'LinkedIn', value: 12 },
  { name: 'Other', value: 8 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

const REPORTS = [
  { id: '1', name: 'Monthly Sales Summary', type: 'REVENUE', lastRun: '2 hours ago', status: 'READY' },
  { id: '2', name: 'Lead Conversion Funnel', type: 'PIPELINE', lastRun: '1 day ago', status: 'READY' },
  { id: '3', name: 'Team Activity Report', type: 'ACTIVITY', lastRun: '3 hours ago', status: 'READY' },
  { id: '4', name: 'Campaign Performance', type: 'MARKETING', lastRun: 'Never', status: 'NOT_RUN' },
];

export default function AdminCRMReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Reports</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Sales & Pipeline Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          {['1M', '3M', '6M', '1Y'].map(p => (
            <button key={p} onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedPeriod === p ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white'}`}>
              {p}
            </button>
          ))}
          <button className="p-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$379K', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+34%', up: true },
          { label: 'Deals Closed', value: '161', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '+28%', up: true },
          { label: 'Leads Generated', value: '809', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+41%', up: true },
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
            <Activity className="w-4 h-4 text-indigo-400" /> Revenue & Deals Over Time
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Lead Sources
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '11px' }} formatter={(v: any) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-400">{s.name}</span>
                </div>
                <span className="text-white font-black">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Saved Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map(r => (
            <div key={r.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                  <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{r.name}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest">{r.type} · Last run: {r.lastRun}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-xs font-black text-gray-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
