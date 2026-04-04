"use client";

import {
  BarChart3, TrendingUp, MessageSquare, Bot, Zap,
  Star, Clock, Users, ArrowUpRight, ArrowDownRight,
  Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';

const conversationData = [
  { day: 'Mon', handled: 42, resolved: 38, escalated: 4 },
  { day: 'Tue', handled: 65, resolved: 60, escalated: 5 },
  { day: 'Wed', handled: 58, resolved: 52, escalated: 6 },
  { day: 'Thu', handled: 80, resolved: 75, escalated: 5 },
  { day: 'Fri', handled: 91, resolved: 87, escalated: 4 },
  { day: 'Sat', handled: 34, resolved: 32, escalated: 2 },
  { day: 'Sun', handled: 28, resolved: 27, escalated: 1 },
];

const tokenData = [
  { month: 'Jan', tokens: 180000 },
  { month: 'Feb', tokens: 240000 },
  { month: 'Mar', tokens: 420000 },
  { month: 'Apr', tokens: 380000 },
];

export default function AdminAIAnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">AI Analytics</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Performance Metrics & Usage Intelligence</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: '1,247', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+18%', up: true },
          { label: 'Avg Resolution Rate', value: '94%', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+2%', up: true },
          { label: 'Avg Response Time', value: '1.4s', icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: '-0.3s', up: true },
          { label: 'Tokens This Month', value: '420K', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '+11%', up: true },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              <span className={`text-[10px] font-black flex items-center gap-0.5 ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.trend}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Conversation Volume (7d)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={conversationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="escalated" name="Escalated" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Token Usage Trend
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={tokenData}>
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
              <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} formatter={(v: any) => [`${(v / 1000).toFixed(0)}K`, 'Tokens']} />
              <Area type="monotone" dataKey="tokens" stroke="#f59e0b" strokeWidth={2} fill="url(#tokenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Agent Performance Breakdown</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {['Agent', 'Type', 'Conversations', 'Resolution Rate', 'Avg Response', 'Escalations'].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {[
              { name: 'Sales Qualifier Bot', type: 'SALES', convos: 482, rate: '91%', resp: '1.2s', esc: 12 },
              { name: 'Support Assistant', type: 'SUPPORT', convos: 1204, rate: '95%', resp: '0.8s', esc: 8 },
              { name: 'Lead Nurture Agent', type: 'NURTURE', convos: 89, rate: '78%', resp: '2.1s', esc: 19 },
            ].map(row => (
              <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 text-sm font-bold text-white">{row.name}</td>
                <td className="px-5 py-4"><span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 uppercase">{row.type}</span></td>
                <td className="px-5 py-4 text-sm text-gray-300">{row.convos.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm font-black text-emerald-400">{row.rate}</td>
                <td className="px-5 py-4 text-sm text-gray-300 font-mono">{row.resp}</td>
                <td className="px-5 py-4 text-sm text-amber-400 font-black">{row.esc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
