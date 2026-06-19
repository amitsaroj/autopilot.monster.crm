'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { leadService, Lead } from '@/services/lead.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function LeadScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await leadService.getLead(id);
        setLead(parseApiData<Lead>(res));
      } catch {
        toast.error('Failed to load lead score');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin" />;
  if (!lead) return <p className="text-sm text-muted-foreground">Lead not found.</p>;

  return (
    <div className="space-y-6 max-w-lg animate-fade-in">
      <Link href={`/crm/leads/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Lead
      </Link>
      <h1 className="page-title">Lead Score</h1>
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-5xl font-bold text-[hsl(246,80%,60%)]">{lead.score}</p>
        <p className="text-sm text-muted-foreground mt-2">out of 100</p>
      </div>
      {lead.aiSummary && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">AI Summary</p>
          <p className="text-sm">{lead.aiSummary}</p>
        </div>
      )}
    </div>
  );
}
