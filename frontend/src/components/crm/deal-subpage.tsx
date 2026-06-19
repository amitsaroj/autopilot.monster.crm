'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { use } from 'react';

import { dealService, Deal } from '@/services/deal.service';

interface DealSubpageProps {
  params: Promise<{ id: string }>;
  title: string;
  children: (deal: Deal) => ReactNode;
}

export function DealSubpage({ params, title, children }: DealSubpageProps) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dealService.getDeal(id);
        setDeal((res as { data: { data: Deal } }).data.data);
      } catch {
        setDeal(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deal) {
    return <p className="text-sm text-muted-foreground">Deal not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <Link
            href={`/crm/deals/${id}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {deal.name}
          </Link>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      {children(deal)}
    </div>
  );
}
