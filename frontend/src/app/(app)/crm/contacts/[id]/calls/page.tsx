'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService } from '@/services/contact.service';

interface VoiceCall {
  id: string;
  direction: string;
  status: string;
  from: string;
  to: string;
  durationSeconds: number;
  createdAt: string;
}

export default function ContactCallsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ContactSubpage params={params} title="Calls">
      {(contact) => <CallsList contactId={contact.id} />}
    </ContactSubpage>
  );
}

function CallsList({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<VoiceCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getCalls(contactId);
        setItems((res as { data: { data: VoiceCall[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contactId]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No call history.</p>;

  return (
    <div className="space-y-3">
      {items.map((call) => (
        <div key={call.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between">
            <p className="font-medium">{call.direction} · {call.status}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(call.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {call.from} → {call.to} · {call.durationSeconds}s
          </p>
        </div>
      ))}
    </div>
  );
}
