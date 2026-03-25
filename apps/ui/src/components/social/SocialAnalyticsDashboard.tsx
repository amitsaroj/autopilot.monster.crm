'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  MousePointer2, 
  Share2, 
  Heart,
  Facebook,
  Twitter,
  Linkedin,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalLikes: number;
    totalShares: number;
    totalClicks: number;
    totalPosts: number;
  };
  engagementTrend: any[];
  platformDistribution: Record<string, number>;
}

interface SocialAnalyticsDashboardProps {
  data: AnalyticsData;
}

export function SocialAnalyticsDashboard({ data }: SocialAnalyticsDashboardProps) {
  const { overview, platformDistribution } = data;

  const stats = [
    { label: 'Total Engagement', value: overview.totalLikes + overview.totalShares + overview.totalClicks, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Likes', value: overview.totalLikes, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Shares', value: overview.totalShares, icon: Share2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Clicks', value: overview.totalClicks, icon: MousePointer2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-xl transition group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stat.value.toLocaleString()}</h3>
              <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Distribution */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-[40px] border border-gray-100 dark:border-white/5 p-10 shadow-soft">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Platform Distribution</h3>
              <p className="text-sm text-gray-400 font-bold">Content volume across your connected networks.</p>
            </div>
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>

          <div className="space-y-8">
            {Object.entries(platformDistribution).map(([platform, count], idx) => (
              <div key={platform} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {platform === 'FACEBOOK' && <Facebook className="w-5 h-5 text-blue-600" />}
                    {platform === 'TWITTER' && <Twitter className="w-5 h-5 text-sky-400" />}
                    {platform === 'LINKEDIN' && <Linkedin className="w-5 h-5 text-indigo-600" />}
                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 capitalize">{platform.toLowerCase()}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{((count / overview.totalPosts) * 100 || 0).toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / overview.totalPosts) * 100 || 0}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    className={cn(
                      "h-full rounded-full shadow-lg",
                      platform === 'FACEBOOK' ? "bg-blue-600" :
                      platform === 'TWITTER' ? "bg-sky-400" :
                      "bg-indigo-600"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Insights */}
        <div className="bg-indigo-600 rounded-[40px] p-10 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between">
          <Target className="absolute -right-12 -top-12 w-64 h-64 text-white/10 rotate-12" />
          
          <div className="relative">
            <h3 className="text-2xl font-black mb-4">AI Growth Insights</h3>
            <p className="text-indigo-100 font-bold text-sm leading-relaxed mb-8 opacity-80">
              Your engagement is peaking on LinkedIn. We recommend scheduling 2 more posts between 9 AM - 11 AM EST to maximize reach.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">1.1x</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Suggested multiplier</p>
                  <p className="text-xs font-bold">Post frequency increase</p>
                </div>
              </div>
            </div>
          </div>

          <button className="relative w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-xl transition hover:bg-gray-50 active:scale-95">
            Optimize Strategy
          </button>
        </div>
      </div>
    </div>
  );
}
