'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService } from '@/services/contact.service';

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  status: string;
}

export default function ContactDealsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ContactSubpage params={params} title="Deals">
      {(contact) => <DealsList contactId={contact.id} />}
    </ContactSubpage>
  );
}

function DealsList({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getDeals(contactId);
        setItems((res as { data: { data: Deal[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contactId]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No deals linked.</p>;

  return (
    <div className="space-y-3">
      {items.map((deal) => (
        <Link
          key={deal.id}
          href={`/crm/deals/${deal.id}`}
          className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/30"
        >
          <p className="font-medium">{deal.name}</p>
          <p className="text-sm text-muted-foreground">
            {deal.currency} {deal.value} · {deal.status}
          </p>
        </Link>
      ))}
    </div>
  );
}
