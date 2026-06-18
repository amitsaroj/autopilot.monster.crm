'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';

interface CrmAnalytics {
  contacts: number;
  leads: number;
  deals: number;
  conversionRate: number;
}

export default function AnalyticsCrmPage() {
  const [data, setData] = useState<CrmAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/analytics/crm');
        setData(parseApiData<CrmAnalytics>(res));
      } catch {
        toast.error('Failed to load CRM analytics');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!data) return <p className="text-sm text-muted-foreground">No analytics data.</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">CRM Analytics</h1>
        <p className="page-description">Key CRM performance metrics</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Contacts', value: data.contacts },
          { label: 'Leads', value: data.leads },
          { label: 'Deals', value: data.deals },
          { label: 'Conversion Rate', value: `${data.conversionRate.toFixed(1)}%` },
        ].map((stat) => (
          <div key={stat.label} className="stat-card text-center">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
