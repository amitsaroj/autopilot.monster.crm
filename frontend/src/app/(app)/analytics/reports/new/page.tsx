'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import {
  analyticsReportService,
  AnalyticsReportType,
} from '@/services/analytics-report.service';

const REPORT_TYPES: AnalyticsReportType[] = [
  'OVERVIEW',
  'CRM',
  'REVENUE',
  'PIPELINE',
  'TEAM',
  'VOICE',
  'WHATSAPP',
];

export default function NewAnalyticsReportPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState<AnalyticsReportType>('OVERVIEW');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await analyticsReportService.create({ name, description, reportType });
      const id = res.data?.data?.id;
      toast.success('Report created');
      router.push(id ? `/analytics/reports/${id}` : '/analytics/reports');
    } catch {
      toast.error('Failed to create report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <Link
        href="/analytics/reports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Reports
      </Link>
      <h1 className="page-title">New Report</h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as AnalyticsReportType)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm bg-[hsl(246,80%,60%)] text-white rounded-lg disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Create Report'}
        </button>
      </form>
    </div>
  );
}
