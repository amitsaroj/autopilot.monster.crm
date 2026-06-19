'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, LayoutDashboard, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  analyticsDashboardService,
  AnalyticsDashboard,
} from '@/services/analytics-dashboard.service';

export default function AnalyticsDashboardsPage() {
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await analyticsDashboardService.list();
      setDashboards(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load dashboards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dashboard?')) return;
    try {
      await analyticsDashboardService.remove(id);
      toast.success('Dashboard deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboards</h1>
          <p className="page-description">Custom analytics dashboards</p>
        </div>
        <Link
          href="/analytics/dashboards/new"
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg"
        >
          <Plus className="h-4 w-4" /> New Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : dashboards.length === 0 ? (
        <p className="text-sm text-muted-foreground">No dashboards yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="rounded-xl border border-border bg-card p-4 flex items-start justify-between"
            >
              <Link href={`/analytics/dashboards/${dashboard.id}`} className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <LayoutDashboard className="h-4 w-4 text-[hsl(246,80%,60%)]" />
                  <h3 className="font-medium">{dashboard.name}</h3>
                  {dashboard.isDefault && (
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">Default</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dashboard.description ?? 'No description'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {dashboard.widgets.length} widgets
                </p>
              </Link>
              <button
                onClick={() => void handleDelete(dashboard.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
