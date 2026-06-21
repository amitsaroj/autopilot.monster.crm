'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

import {
  analyticsReportService,
  AnalyticsReport,
} from '@/services/analytics-report.service';

export default function AnalyticsReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await analyticsReportService.get(id);
      const data = res.data?.data ?? null;
      setReport(data);
      if (data?.lastResults) {
        setResults(data.lastResults);
      } else {
        const resultsRes = await analyticsReportService.results(id);
        setResults(resultsRes.data?.data ?? null);
      }
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleRun = async () => {
    setRunning(true);
    try {
      const res = await analyticsReportService.run(id);
      setReport(res.data?.data ?? report);
      setResults(res.data?.data?.lastResults ?? null);
      toast.success('Report executed');
    } catch {
      toast.error('Report run failed');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report) {
    return <p className="text-sm text-muted-foreground">Report not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/analytics/reports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Reports
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">{report.name}</h1>
          <p className="page-description">{report.description ?? report.reportType}</p>
        </div>
        <button
          onClick={() => void handleRun()}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {running ? 'Running...' : 'Run Report'}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Status: {report.status}
          {report.lastRunAt && ` · Last run ${new Date(report.lastRunAt).toLocaleString()}`}
        </p>
        {results ? (
          <pre className="text-xs overflow-auto bg-muted/30 p-4 rounded-lg">
            {JSON.stringify(results, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No results yet. Run the report to generate data.</p>
        )}
      </div>
    </div>
  );
}
