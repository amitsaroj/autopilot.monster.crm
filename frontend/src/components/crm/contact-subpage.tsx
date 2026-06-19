'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { use } from 'react';

import { contactService, Contact } from '@/services/contact.service';

interface ContactSubpageProps {
  params: Promise<{ id: string }>;
  title: string;
  children: (contact: Contact) => ReactNode;
}

export function ContactSubpage({ params, title, children }: ContactSubpageProps) {
  const { id } = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getContact(id);
        setContact((res as { data: { data: Contact } }).data.data);
      } catch {
        setContact(null);
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

  if (!contact) {
    return <p className="text-sm text-muted-foreground">Contact not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <Link
            href={`/crm/contacts/${id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> {contact.firstName} {contact.lastName}
          </Link>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      {children(contact)}
    </div>
  );
}
