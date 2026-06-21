'use client';

import { useEffect, useState, use } from 'react';
import { ArrowLeft, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { companyService, CompanyActivity } from '@/services/company.service';

export default function CompanyActivitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activities, setActivities] = useState<CompanyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await companyService.getActivities(id);
        setActivities(res.data?.data ?? []);
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
      <div className="flex items-center gap-3">
        <Link href={`/crm/companies/${id}`} className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="page-title">Company Activities</h1>
          <p className="page-description">{activities.length} activities recorded</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activities for this company.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-border bg-card p-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.type} · {new Date(activity.occurredAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
