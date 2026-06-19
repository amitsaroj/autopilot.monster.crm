'use client';

import { useEffect, useState } from 'react';
import { leadService, Lead } from '@/services/lead.service';

export default function LeadSourcesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    void leadService.getLeads().then((r) => setLeads((r as { data: { data: Lead[] } }).data?.data ?? []));
  }, []);

  const bySource = leads.reduce<Record<string, number>>((acc, lead) => {
    const source = String((lead.metadata as Record<string, unknown>)?.source ?? 'unknown');
    acc[source] = (acc[source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-bold">Lead Sources</h1>
      <ul className="divide-y rounded-xl border border-border bg-card">
        {Object.entries(bySource).map(([source, count]) => (
          <li key={source} className="flex justify-between p-4"><span className="font-medium capitalize">{source}</span><span>{count} leads</span></li>
        ))}
      </ul>
    </div>
  );
}
