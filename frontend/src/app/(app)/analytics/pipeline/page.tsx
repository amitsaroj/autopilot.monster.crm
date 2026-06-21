'use client';

import { useEffect, useState } from 'react';
import { Loader2, BarChart3, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { analyticsService, PipelineStageAnalytics } from '@/services/analytics.service';

export default function AnalyticsPipelinePage() {
  const [stages, setStages] = useState<PipelineStageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setStages((await analyticsService.getPipelineStages()) ?? []);
    } catch {
      toast.error('Failed to load pipeline analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const maxCount = Math.max(...stages.map((stage) => stage.count), 1);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline Analytics</h1>
          <p className="page-description">Open deal distribution by pipeline stage</p>
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

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pipeline Value', value: `$${(totalValue / 1000).toFixed(1)}k`, icon: BarChart3, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Open Deals', value: String(totalDeals), icon: Target, color: 'text-blue-400' },
          { label: 'Stages', value: String(stages.length), icon: TrendingUp, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-5">Stage Breakdown</h2>
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open deals in pipeline.</p>
        ) : (
          <div className="space-y-3">
            {stages.map((stage) => {
              const width = Math.max((stage.count / maxCount) * 100, 8);
              return (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-28 text-xs text-right text-muted-foreground shrink-0">{stage.stage}</div>
                  <div className="flex-1 relative">
                    <div className="h-9 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg bg-[hsl(246,80%,60%)] opacity-80 flex items-center px-3"
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {stage.count} deals · ${stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
