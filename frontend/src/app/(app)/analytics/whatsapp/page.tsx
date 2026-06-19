'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsService, WhatsappAnalytics } from '@/services/analytics.service';

export default function WhatsappAnalyticsPage() {
  const [data, setData] = useState<WhatsappAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await analyticsService.getWhatsapp());
    } catch {
      toast.error('Failed to load WhatsApp analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    return <p className="text-sm text-muted-foreground">No WhatsApp analytics data.</p>;
  }

  const inboundPct = data.total > 0 ? (data.inbound / data.total) * 100 : 0;
  const outboundPct = data.total > 0 ? (data.outbound / data.total) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">WhatsApp Analytics</h1>
          <p className="page-description">Message volume and direction breakdown</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Messages', value: data.total, icon: MessageSquare, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Inbound', value: data.inbound, icon: ArrowDownLeft, color: 'text-green-500' },
          { label: 'Outbound', value: data.outbound, icon: ArrowUpRight, color: 'text-blue-500' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card text-center">
            <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">Direction Split</h2>
        {[
          { label: 'Inbound', pct: inboundPct, color: 'bg-green-500' },
          { label: 'Outbound', pct: outboundPct, color: 'bg-blue-500' },
        ].map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>{item.label}</span>
              <span>{item.pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
