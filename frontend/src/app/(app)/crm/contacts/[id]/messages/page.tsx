'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService } from '@/services/contact.service';

interface WhatsAppMessage {
  id: string;
  direction: string;
  body: string;
  status: string;
  createdAt: string;
}

export default function ContactMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ContactSubpage params={params} title="Messages">
      {(contact) => <MessagesList contactId={contact.id} />}
    </ContactSubpage>
  );
}

function MessagesList({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getWhatsapp(contactId);
        setItems((res as { data: { data: WhatsAppMessage[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contactId]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No messages found.</p>;

  return (
    <div className="space-y-3">
      {items.map((msg) => (
        <div key={msg.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between">
            <p className="text-xs uppercase text-muted-foreground">{msg.direction}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm mt-1">{msg.body}</p>
        </div>
      ))}
    </div>
  );
}
