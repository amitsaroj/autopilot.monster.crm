'use client';

import { useEffect, useState } from 'react';
import { Loader2, Phone, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsService, VoiceAnalytics } from '@/services/analytics.service';

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default function VoiceAnalyticsPage() {
  const [data, setData] = useState<VoiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await analyticsService.getVoice());
    } catch {
      toast.error('Failed to load voice analytics');
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
    return <p className="text-sm text-muted-foreground">No voice analytics data.</p>;
  }

  const completionRate = data.totalCalls > 0 ? (data.completedCalls / data.totalCalls) * 100 : 0;

  const kpis = [
    { label: 'Total Calls', value: data.totalCalls.toLocaleString(), icon: Phone },
    { label: 'Completed Calls', value: data.completedCalls.toLocaleString(), icon: CheckCircle2 },
    { label: 'Avg. Duration', value: formatDuration(data.averageDuration), icon: Clock },
    { label: 'Completion Rate', value: `${completionRate.toFixed(1)}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Voice Analytics</h1>
          <p className="text-muted-foreground mt-1">Call volume and completion metrics</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-4"
          >
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 w-fit">
              <kpi.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <p className="text-3xl font-black text-foreground mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
