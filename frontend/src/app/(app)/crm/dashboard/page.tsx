'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '@/lib/api/client';
import { cn } from '@/lib/utils';

export default function CrmDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summary, pipeline, revenue, funnel] = await Promise.all([
        api.get('/crm/reports/summary'),
        api.get('/crm/reports/pipeline'),
        api.get('/crm/reports/revenue-trend'),
        api.get('/crm/reports/lead-funnel'),
      ]);

      setData({
        summary: summary.data.data,
        pipeline: pipeline.data.data,
        revenue: revenue.data.data,
        funnel: funnel.data.data,
      });
    } catch (e) {
      console.error('Analytics extraction failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );

  const COLORS = ['#155eef', '#168bff', '#0089a8', '#d946ef', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wide border border-blue-500/20">
              Market Intelligence Live
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-foreground tracking-tighter uppercase italic">
            CRM Analytics Nexus
          </h1>
          <p className="text-muted-foreground text-[11px] font-bold mt-1 uppercase tracking-[0.2em]">
            Longitudinal performance analysis and revenue trajectory
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button
            onClick={fetchAnalytics}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] text-xs font-semibold uppercase tracking-wide transition-all shadow-2xl shadow-blue-600/20 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" /> Refresh Matrix
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: 'Pipeline Velocity',
            value: `$${(data?.summary?.totalRevenue / 1000).toFixed(1)}k`,
            trend: '+12.4%',
            icon: DollarSign,
            color: 'text-emerald-700 dark:text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Acquisition Mass',
            value: data?.summary?.totalLeads,
            trend: '+5.2%',
            icon: Users,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Conversion Delta',
            value: `${data?.summary?.winRate.toFixed(1)}%`,
            trend: '-2.1%',
            icon: Target,
            color: 'text-amber-700 dark:text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Active Vectors',
            value: data?.summary?.totalDeals,
            trend: '+8.7%',
            icon: TrendingUp,
            color: 'text-blue-700 dark:text-blue-400',
            bg: 'bg-blue-500/10',
          },
        ].map((card, i) => (
          <div
            key={i}
            className="p-8 rounded-xl bg-card border border-border hover:border-blue-500/20 transition-all group relative overflow-hidden backdrop-blur-md shadow-soft"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-card rounded-full blur-3xl group-hover:bg-blue-500/5 transition-colors" />
            <div className="flex justify-between items-start mb-6">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner',
                  card.bg,
                  card.color,
                )}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter',
                  card.trend.startsWith('+')
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-400',
                )}
              >
                {card.trend.startsWith('+') ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {card.trend}
              </div>
            </div>
            <h3 className="text-3xl font-semibold text-foreground tracking-tighter mb-1">
              {card.value}
            </h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="p-10 rounded-xl bg-card border border-border shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter leading-none mb-1">
                Revenue Trajectory
              </h3>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Monthly conversion capitalization
              </p>
            </div>
            <div className="flex gap-2 p-1.5 rounded-2xl bg-card border border-border">
              {['6M', '1Y', 'ALL'].map((t) => (
                <button
                  key={t}
                  className="px-3 py-1 rounded-lg text-[8px] font-semibold bg-card text-muted-foreground hover:text-foreground dark:hover:text-white transition-all uppercase"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#155eef" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#155eef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '16px',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#fff' }}
                  labelStyle={{
                    fontSize: '10px',
                    color: '#155eef',
                    marginBottom: '8px',
                    fontWeight: '900',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#155eef"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="p-10 rounded-xl bg-card border border-border shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-semibold text-foreground uppercase tracking-tighter leading-none mb-1">
                Pipeline Density
              </h3>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Relational stage distribution
              </p>
            </div>
            <button className="p-3 rounded-2xl bg-card border border-border text-muted-foreground hover:text-foreground dark:hover:text-white transition-all">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.pipeline}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '16px',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#fff' }}
                  labelStyle={{
                    fontSize: '10px',
                    color: '#155eef',
                    marginBottom: '8px',
                    fontWeight: '900',
                  }}
                />
                <Bar dataKey="amount" fill="#155eef" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel & Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-10 rounded-xl bg-card border border-border shadow-2xl overflow-hidden relative">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-10 text-center italic">
            Lead Funnel Distribution
          </h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.funnel}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="count"
                >
                  {data?.funnel?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-semibold text-foreground tracking-tighter">
                {data?.summary?.totalLeads}
              </span>
              <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">
                Total Vectors
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {data?.funnel?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-10 rounded-xl bg-card border border-border shadow-2xl backdrop-blur-md">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-10 flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-700 dark:text-amber-400" /> Lead Source Efficacy
          </h3>
          <div className="space-y-6">
            {[
              { name: 'Direct Organic', value: 72, color: 'bg-blue-600', raw: 1420 },
              { name: 'Nexus API Bridge', value: 58, color: 'bg-emerald-500', raw: 840 },
              { name: 'Partner Referral', value: 41, color: 'bg-amber-500', raw: 310 },
              { name: 'Email Sequence', value: 24, color: 'bg-rose-500', raw: 190 },
            ].map((source, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                    {source.name}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {source.raw} Signals
                  </span>
                </div>
                <div className="h-3 w-full bg-card rounded-full overflow-hidden border border-border shadow-inner">
                  <div
                    className={cn(
                      'h-full rounded-full animate-in slide-in-from-left duration-1000 shadow-lg shadow-blue-500/10',
                      source.color,
                    )}
                    style={{ width: `${source.value}%`, transitionDelay: `${i * 200}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Star({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
