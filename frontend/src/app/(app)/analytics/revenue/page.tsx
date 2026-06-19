'use client';

import { useEffect, useState } from 'react';
import { Loader2, DollarSign, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsService, RevenueAnalytics } from '@/services/analytics.service';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function RevenueInsightsPage() {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setData(await analyticsService.getRevenue());
      } catch {
        toast.error('Failed to load revenue analytics');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">No revenue data available.</p>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground">Revenue Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">MRR and ARR from won deals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl">
          <p className="text-slate-400 text-sm font-semibold tracking-wider">ANNUAL RECURRING REVENUE (ARR)</p>
          <h2 className="text-4xl font-black mt-2 mb-4">{formatCurrency(data.arr)}</h2>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ArrowUpRight className="w-3 h-3 text-green-400" />
            Based on won deal value × 12
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-semibold tracking-wider">MONTHLY RECURRING REVENUE</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">{formatCurrency(data.mrr)}</h2>
          <p className="text-muted-foreground text-sm">{data.wonDealCount} won deals</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground text-sm font-semibold tracking-wider">WON DEALS</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">{data.wonDealCount}</h2>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Closed-won revenue source</span>
          </div>
        </div>
      </div>
    </div>
  );
}
