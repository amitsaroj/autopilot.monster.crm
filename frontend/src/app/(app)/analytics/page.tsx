'use client';

import { useEffect, useState } from 'react';
import { Loader2, DollarSign, Users, Target, Phone, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsService, AnalyticsOverview } from '@/services/analytics.service';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function AnalyticsMainPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await analyticsService.getOverview());
    } catch {
      toast.error('Failed to load analytics overview');
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
    return <p className="text-sm text-muted-foreground">No analytics data available.</p>;
  }

  const conversionRate = data.leads > 0 ? ((data.wonDeals / data.leads) * 100).toFixed(1) : '0.0';

  const kpis = [
    { title: 'Won Revenue', value: formatCurrency(data.wonValue), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'Contacts', value: data.contacts.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Pipeline Value', value: formatCurrency(data.pipelineValue), icon: Target, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Open Deals', value: data.openDeals.toLocaleString(), icon: Target, color: 'text-orange-500', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Live KPIs across CRM, voice, and WhatsApp</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Leads', value: data.leads, href: '/analytics/crm' },
          { label: 'Won Deals', value: data.wonDeals, href: '/analytics/revenue' },
          { label: 'Voice Calls', value: data.calls, href: '/analytics/voice' },
          { label: 'WhatsApp Messages', value: data.whatsappMessages, href: '/analytics/whatsapp' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value.toLocaleString()}</p>
            <p className="text-xs text-[hsl(246,80%,60%)] mt-2">View details →</p>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Lead-to-won conversion: <span className="font-semibold text-foreground">{conversionRate}%</span>
        {' · '}
        <Phone className="inline h-3.5 w-3.5 -mt-0.5" /> {data.calls} calls
        {' · '}
        <MessageSquare className="inline h-3.5 w-3.5 -mt-0.5" /> {data.whatsappMessages} WhatsApp messages
      </div>
    </div>
  );
}
