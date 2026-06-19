'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  analyticsDashboardService,
  AnalyticsDashboard,
} from '@/services/analytics-dashboard.service';

export default function AnalyticsDashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsDashboardService.get(id);
        setDashboard(res.data?.data ?? null);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dashboard) {
    return <p className="text-muted-foreground">Dashboard not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/analytics/dashboards" className="inline-flex items-center gap-2 text-sm text-[hsl(246,80%,60%)]">
        <ArrowLeft className="h-4 w-4" /> Back to dashboards
      </Link>
      <div>
        <h1 className="page-title">{dashboard.name}</h1>
        <p className="page-description">{dashboard.description ?? 'No description'}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {dashboard.widgets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No widgets configured.</p>
        ) : (
          dashboard.widgets.map((widget, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">{String(widget.title ?? `Widget ${index + 1}`)}</p>
              <p className="text-xs text-muted-foreground mt-1">{String(widget.type ?? 'metric')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
