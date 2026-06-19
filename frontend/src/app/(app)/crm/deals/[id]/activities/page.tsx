'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { DealSubpage } from '@/components/crm/deal-subpage';
import { dealService } from '@/services/deal.service';

interface Activity {
  id: string;
  type: string;
  subject: string;
  description?: string;
  occurredAt: string;
}

export default function DealActivitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <DealSubpage params={params} title="Activities">
      {(deal) => <ActivitiesList dealId={deal.id} />}
    </DealSubpage>
  );
}

function ActivitiesList({ dealId }: { dealId: string }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dealService.getActivities(dealId);
        setItems((res as { data: { data: Activity[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [dealId]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No activities for this deal.</p>;
  }

  return (
    <ul className="divide-y rounded-xl border border-border bg-card">
      {items.map((item) => (
        <li key={item.id} className="p-4">
          <p className="font-medium">{item.subject}</p>
          <p className="text-xs text-muted-foreground">{item.type} · {new Date(item.occurredAt).toLocaleString()}</p>
          {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
        </li>
      ))}
    </ul>
  );
}
