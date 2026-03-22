"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Phone, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function VoiceAnalyticsPage() {
  const kpis = [
    { label: 'Total Calls', value: '14,284', change: '+12.5%', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Avg. Duration', value: '3m 42s', change: '-2.1%', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Conversion Rate', value: '24.8%', change: '+5.4%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'Cost per Lead', value: '$0.42', change: '-15.0%', icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Voice ROI Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Real-time performance metrics for your autonomous AI workforce.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                kpi.change.startsWith('+') ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
              }`}>
                {kpi.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Call Volume vs. Conversions
            </h3>
            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl text-xs font-bold">
              <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 shadow-sm text-indigo-600">Weekly</button>
              <button className="px-3 py-1.5 rounded-lg text-gray-500">Monthly</button>
            </div>
          </div>
          <div className="h-80 w-full flex items-end justify-between gap-2 px-4">
             {[40, 65, 45, 90, 55, 75, 60, 85, 40, 70, 50, 95].map((h, i) => (
               <div key={i} className="flex-1 space-y-2">
                 <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${h}%` }}
                   className={`w-full rounded-t-lg bg-gradient-to-t ${i % 3 === 0 ? 'from-indigo-600 to-purple-500' : 'from-indigo-400 to-indigo-300'} opacity-80`}
                 />
               </div>
             ))}
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500 font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              AI Calls
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              Conversions
            </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Lead Sentiment
          </h3>
          <div className="space-y-6 py-4">
             {[
               { label: 'Positive', value: 65, color: 'bg-green-500' },
               { label: 'Neutral', value: 25, color: 'bg-blue-500' },
               { label: 'Negative', value: 10, color: 'bg-red-500' },
             ].map(item => (
               <div key={item.label} className="space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                   <span className="text-gray-500 uppercase tracking-widest">{item.label}</span>
                   <span className="dark:text-white">{item.value}%</span>
                 </div>
                 <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${item.value}%` }}
                     className={`h-full ${item.color}`}
                   />
                 </div>
               </div>
             ))}
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
             <Activity className="w-5 h-5 text-indigo-500 mt-0.5" />
             <p className="text-[11px] leading-relaxed text-indigo-700 dark:text-indigo-400 font-medium italic">
               "AI agents are maintaining a 65% positive sentiment score. Conversion rates peaked during the evening hours last Thursday."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
