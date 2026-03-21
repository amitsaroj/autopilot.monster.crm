"use client";

import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Download, Filter, TrendingUp, Users, DollarSign, Activity, Calendar } from 'lucide-react';

const visitData = [
  { name: 'Mon', visits: 4000, leads: 240 },
  { name: 'Tue', visits: 3000, leads: 139 },
  { name: 'Wed', visits: 2000, leads: 980 },
  { name: 'Thu', visits: 2780, leads: 390 },
  { name: 'Fri', visits: 1890, leads: 480 },
  { name: 'Sat', visits: 2390, leads: 380 },
  { name: 'Sun', visits: 3490, leads: 430 },
];

const sourceData = [
  { name: 'Organic', value: 400 },
  { name: 'Direct', value: 300 },
  { name: 'Social', value: 300 },
  { name: 'Paid', value: 200 },
];

export default function AnalyticsMainPage() {
  const [dateRange, setDateRange] = useState('Last 7 Days');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">High-level metrics across sales, marketing, and AI agent performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-background border border-input text-foreground text-sm rounded-lg px-4 py-2 pr-8 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <button className="p-2 border border-input rounded-lg hover:bg-muted text-muted-foreground transition-colors shadow-sm bg-background flex items-center gap-2">
            <Filter className="w-4 h-4" /> <span className="hidden sm:inline text-sm font-medium">Add Filter</span>
          </button>
          <button className="p-2 border border-input rounded-lg hover:bg-muted text-muted-foreground transition-colors shadow-sm bg-background flex items-center gap-2">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: '$124,500', trend: '+14%', up: true, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
          { title: 'New Leads', value: '3,842', trend: '+22%', up: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
          { title: 'Conversion Rate', value: '4.8%', trend: '-1.2%', up: false, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100' },
          { title: 'AI Agent Handled', value: '89%', trend: '+5%', up: true, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-100' },
        ].map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${kpi.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpi.trend}
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lead Gen Trend */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold">Lead Generation vs Traffic</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="leads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-6">Traffic Sources</h2>
          <div className="space-y-6">
            {sourceData.map((src, i) => {
              const total = sourceData.reduce((acc, curr) => acc + curr.value, 0);
              const percent = Math.round((src.value / total) * 100);
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];
              
              return (
                <div key={src.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{src.name}</span>
                    <span className="text-muted-foreground font-semibold">{percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <button className="w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors rounded-lg">
              View Detailed Source Report &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
