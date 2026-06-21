'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { activityService, Activity } from '@/services/activity.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function LeadActivitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await activityService.getActivities();
        const all = parseApiData<Activity[]>(res) ?? [];
        setItems(all.filter((a) => (a as Activity & { leadId?: string }).leadId === id || a.contactId === id));
      } catch {
        toast.error('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href={`/crm/leads/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Lead
      </Link>
      <h1 className="page-title">Lead Activities</h1>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activities recorded.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between">
                <p className="font-medium text-sm">{item.subject}</p>
                <span className="text-xs text-muted-foreground">{new Date(item.occurredAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{item.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
