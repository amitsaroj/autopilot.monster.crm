'use client';

import { useEffect, useState, use } from 'react';
import { ArrowLeft, Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { companyService, CompanyDeal } from '@/services/company.service';

export default function CompanyDealsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [deals, setDeals] = useState<CompanyDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await companyService.getDeals(id);
        setDeals(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load deals');
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
          <h1 className="page-title">Company Deals</h1>
          <p className="page-description">{deals.length} deals linked</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : deals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No deals for this company.</p>
      ) : (
        <div className="grid gap-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{deal.name}</p>
                  <p className="text-xs text-muted-foreground">{deal.status}</p>
                </div>
              </div>
              <p className="font-semibold">
                {deal.currency} {deal.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
