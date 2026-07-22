'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

import { analyticsService } from '@/services/analytics.service';
import { importExportService } from '@/services/import-export.service';

const PDF_REPORT_TYPES = [
  { value: 'overview', label: 'CRM Overview' },
  { value: 'revenue', label: 'Revenue (30 days)' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'roi', label: 'Campaign ROI' },
  { value: 'ai-vs-human', label: 'AI vs Human' },
];

export default function AnalyticsExportPage() {
  const [entityType, setEntityType] = useState('contacts');
  const [pdfType, setPdfType] = useState('overview');
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCsvExport = async () => {
    setCsvLoading(true);
    try {
      const res = await importExportService.startExport(entityType, 'csv');
      toast.success(`Export job started: ${res.data.data.id}`);
    } catch {
      toast.error('CSV export failed');
    } finally {
      setCsvLoading(false);
    }
  };

  const handlePdfExport = async () => {
    setPdfLoading(true);
    try {
      const blob = await analyticsService.exportPdf(pdfType);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `analytics-${pdfType}-${Date.now()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('PDF report downloaded');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <h1 className="text-2xl font-bold">Analytics Export</h1>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">PDF Analytics Report</h2>
        <div>
          <label className="text-sm font-medium">Report type</label>
          <select
            value={pdfType}
            onChange={(e) => setPdfType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {PDF_REPORT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={pdfLoading}
          onClick={() => void handlePdfExport()}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </button>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">CSV Data Export</h2>
        <div>
          <label className="text-sm font-medium">Entity</label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {['contacts', 'leads', 'deals', 'companies'].map((entity) => (
              <option key={entity}>{entity}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={csvLoading}
          onClick={() => void handleCsvExport()}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          {csvLoading ? 'Starting…' : 'Start CSV Export Job'}
        </button>
      </div>
    </div>
  );
}
