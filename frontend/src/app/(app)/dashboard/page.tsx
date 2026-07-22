'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  TrendingUp,
  DollarSign,
  BarChart2,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  analyticsService,
  type AnalyticsOverview,
  type PipelineStageStat,
  type RevenueAnalytics,
} from '@/services/analytics.service';
import { activityService, type Activity as CrmActivity } from '@/services/activity.service';
import { taskService, type Task } from '@/services/task.service';
import { parseApiData } from '@/lib/api/parse-response';

function formatCurrency(value: number | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat().format(value);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStageStat[]>([]);
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, pipelineData, revenueData, activitiesRes, tasksRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getPipeline(),
        analyticsService.getRevenue(),
        activityService.getActivities(),
        taskService.getTasks(),
      ]);

      setOverview(overviewData);
      setPipeline(Array.isArray(pipelineData) ? pipelineData : []);
      setRevenue(revenueData);
      setActivities(parseApiData<CrmActivity[]>(activitiesRes) ?? []);
      setTasks(parseApiData<Task[]>(tasksRes) ?? []);
    } catch {
      setOverview(null);
      setPipeline([]);
      setRevenue(null);
      setActivities([]);
      setTasks([]);
      setError('Unable to load dashboard metrics. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = [
    {
      label: 'Total Contacts',
      value: formatNumber(overview?.contacts),
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Active Leads',
      value: formatNumber(overview?.leads),
      icon: Target,
      color: 'text-purple-400',
    },
    {
      label: 'Open Deals',
      value: formatNumber(overview?.openDeals),
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Won Revenue',
      value: formatCurrency(overview?.wonValue ?? revenue?.mrr),
      icon: DollarSign,
      color: 'text-yellow-400',
    },
  ];

  const maxPipelineCount = Math.max(1, ...pipeline.map((s) => s.count));
  const openTasks = tasks
    .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
    .slice(0, 6);
  const recentActivities = activities.slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Live workspace metrics from analytics and CRM</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/crm/activities"
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors inline-flex items-center"
          >
            <Activity className="h-4 w-4 inline mr-2" />
            View activity
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Dashboard unavailable</p>
            <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">From /analytics/overview</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            Pipeline Value
          </h2>
          {pipeline.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              No open pipeline stages yet
            </div>
          ) : (
            <div className="space-y-3">
              {pipeline.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-32 truncate">{stage.stage}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(246,80%,60%)] rounded-full"
                      style={{ width: `${Math.round((stage.count / maxPipelineCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right">
                    {stage.count} · {formatCurrency(stage.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((item) => (
                <li key={item.id} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(246,80%,60%)] mt-1.5 shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-medium">{item.type}</span>
                    {' — '}
                    {item.subject}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Open Tasks</h2>
          {openTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open tasks</p>
          ) : (
            <ul className="space-y-2">
              {openTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-xs uppercase tracking-wide text-muted-foreground w-20">
                    {task.priority}
                  </span>
                  <span className="text-sm text-foreground">{task.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Pipeline Summary</h2>
          {pipeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pipeline data available</p>
          ) : (
            pipeline.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-muted-foreground w-28 truncate">{stage.stage}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[hsl(246,80%,60%)] rounded-full transition-all"
                    style={{ width: `${Math.round((stage.count / maxPipelineCount) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{stage.count}</span>
              </div>
            ))
          )}
          {overview && (
            <p className="text-xs text-muted-foreground mt-4">
              Open pipeline value: {formatCurrency(overview.pipelineValue)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
