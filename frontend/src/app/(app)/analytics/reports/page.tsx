'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, FileText, Trash2, Play } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  analyticsReportService,
  AnalyticsReport,
} from '@/services/analytics-report.service';

export default function AnalyticsReportsPage() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await analyticsReportService.list();
      setReports(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRun = async (id: string) => {
    try {
      await analyticsReportService.run(id);
      toast.success('Report executed');
      void load();
    } catch {
      toast.error('Report run failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await analyticsReportService.remove(id);
      toast.success('Report deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Custom Reports</h1>
          <p className="page-description">Build and schedule custom reports</p>
        </div>
        <Link
          href="/analytics/reports/new"
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg"
        >
          <Plus className="h-4 w-4" /> New Report
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-border bg-card p-4 flex items-start justify-between"
            >
              <Link href={`/analytics/reports/${report.id}`} className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-[hsl(246,80%,60%)]" />
                  <h3 className="font-medium">{report.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded">{report.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{report.reportType}</p>
                {report.lastRunAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last run: {new Date(report.lastRunAt).toLocaleString()}
                  </p>
                )}
              </Link>
              <div className="flex gap-1">
                <button
                  onClick={() => void handleRun(report.id)}
                  className="p-2 rounded-lg hover:bg-muted"
                  title="Run report"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void handleDelete(report.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
