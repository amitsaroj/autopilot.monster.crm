'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService } from '@/services/contact.service';

interface Activity {
  id: string;
  type: string;
  subject?: string;
  description?: string;
  occurredAt: string;
}

export default function ContactActivitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ContactSubpage params={params} title="Activities">
      {(contact) => <ActivitiesList contactId={contact.id} />}
    </ContactSubpage>
  );
}

function ActivitiesList({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getActivities(contactId);
        setItems((res as { data: { data: Activity[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contactId]);

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No activities recorded.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between items-start">
            <p className="font-medium">{item.subject ?? item.type}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(item.occurredAt).toLocaleString()}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
