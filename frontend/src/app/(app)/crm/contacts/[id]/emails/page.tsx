'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService } from '@/services/contact.service';

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  status: string;
  createdAt: string;
}

export default function ContactEmailsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ContactSubpage params={params} title="Emails">
      {(contact) => <EmailsList contactId={contact.id} />}
    </ContactSubpage>
  );
}

function EmailsList({ contactId }: { contactId: string }) {
  const [items, setItems] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getEmails(contactId);
        setItems((res as { data: { data: EmailMessage[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contactId]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No emails found.</p>;

  return (
    <div className="space-y-3">
      {items.map((email) => (
        <div key={email.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex justify-between">
            <p className="font-medium">{email.subject}</p>
            <span className="text-xs text-muted-foreground">
              {new Date(email.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {email.from} → {email.to} · {email.status}
          </p>
        </div>
      ))}
    </div>
  );
}
