"use client";

import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  ComposedChart, Line, Area
} from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const revenueData = [
  { month: 'Jan', arr: 42000, new: 5000, churn: 1200 },
  { month: 'Feb', arr: 48000, new: 7200, churn: 800 },
  { month: 'Mar', arr: 56000, new: 9000, churn: 1500 },
  { month: 'Apr', arr: 68000, new: 14000, churn: 2000 },
  { month: 'May', arr: 85000, new: 19000, churn: 2400 },
  { month: 'Jun', arr: 110000, new: 28000, churn: 3000 },
  { month: 'Jul', arr: 142800, new: 35000, churn: 2200 },
];

export default function RevenueInsightsPage() {
  const [year, setYear] = useState('2024');

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep dive into ARR, MRR, churn, and net renewals.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="appearance-none bg-background border border-input text-foreground text-sm rounded-lg px-4 py-2 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
          >
            <option>2024</option>
            <option>2023</option>
            <option>All Time</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export Financials
          </button>
        </div>
      </div>

      {/* Top Level Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ARR Block */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-wider relative z-10">ANNUAL RECURRING REVENUE (ARR)</p>
          <h2 className="text-4xl font-black mt-2 mb-4 relative z-10">$1.68M</h2>
          <div className="flex items-center gap-3 relative z-10">
            <span className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" /> +24.8%
            </span>
            <span className="text-slate-400 text-xs">from last year</span>
          </div>
        </div>

        {/* MRR Block */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-semibold tracking-wider">MONTHLY RECURRING REVENUE</p>
            <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-4 h-4 text-blue-600" /></div>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">$142,800</h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
              <ArrowUpRight className="w-4 h-4" /> +18.2%
            </span>
            <span className="text-muted-foreground text-sm">vs last month</span>
          </div>
        </div>

        {/* Churn Block */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-semibold tracking-wider">NET REVENUE RETENTION</p>
            <div className="p-2 bg-purple-100 rounded-lg"><Activity className="w-4 h-4 text-purple-600" /></div>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">112.4%</h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-red-500 text-sm font-bold">
              <ArrowDownRight className="w-4 h-4" /> -1.2%
            </span>
            <span className="text-muted-foreground text-sm">churn rate increase</span>
          </div>
        </div>

      </div>

      {/* Complex Chart */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-foreground">Revenue Waterfall</h2>
            <p className="text-sm text-muted-foreground">Monthly breakdown of accumulated ARR, New Business, and Churn</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(246,80%,60%)]" /> ARR</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-400" /> New Biz</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400" /> Churn</div>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={revenueData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="month" scale="band" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `$${value/1000}k`} dx={-10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `$${value/1000}k`} dx={10} />
              <RechartsTooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
              />
              {/* ARR Area Background */}
              <Area yAxisId="left" type="monotone" dataKey="arr" fill="hsl(246,80%,60%)" fillOpacity={0.1} stroke="transparent" />
              {/* Data Bars */}
              <Bar yAxisId="right" dataKey="new" barSize={30} fill="#4ade80" radius={[4, 4, 0, 0]} name="New Business" />
              <Bar yAxisId="right" dataKey="churn" barSize={30} fill="#f87171" radius={[4, 4, 0, 0]} name="Churn" />
              {/* ARR Line overlay */}
              <Line yAxisId="left" type="monotone" dataKey="arr" stroke="hsl(246,80%,60%)" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Total ARR" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
