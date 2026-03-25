'use client';

import React, { useEffect, useState } from 'react';
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
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Filter,
  Download,
  Activity
} from 'lucide-react';
import { analyticsService, AnalyticsSummary, PipelineData, LeadFunnel } from '@/services/analytics.service';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f59e0b'];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [pipeline, setPipeline] = useState<PipelineData[]>([]);
  const [leads, setLeads] = useState<LeadFunnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, pipeRes, leadRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getPipeline(),
          analyticsService.getLeads(),
        ]);
        setSummary((sumRes as any).data.data);
        setPipeline((pipeRes as any).data.data);
        setLeads((leadRes as any).data.data);
      } catch (error) {
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `$${(summary?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, trend: '+12.5%', isUp: true },
    { label: 'Active Deals', value: summary?.totalDeals || 0, icon: Target, trend: '+4.3%', isUp: true },
    { label: 'Conversion Rate', value: `${(summary?.winRate || 0).toFixed(1)}%`, icon: TrendingUp, trend: '-2.1%', isUp: false },
    { label: 'New Leads', value: summary?.totalLeads || 0, icon: Users, trend: '+18.2%', isUp: true },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Real-time performance metrics across your CRM ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="p-6 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm group hover:border-indigo-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deal Pipeline Distribution</h3>
            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lead Funnel Analysis</h3>
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leads}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {leads.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {leads.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{entry.name} ({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border shadow-sm p-10">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Revenue Forecast Performance</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pipeline}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
