'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';

import { ContactSubpage } from '@/components/crm/contact-subpage';
import { contactService, Contact } from '@/services/contact.service';
import { voiceCallService } from '@/services/voice-call.service';

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
      {(contact) => <CallsList contact={contact} />}
    </ContactSubpage>
  );
}

function CallsList({ contact }: { contact: Contact }) {
  const router = useRouter();
  const [items, setItems] = useState<VoiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await contactService.getCalls(contact.id);
        setItems((res as { data: { data: VoiceCall[] } }).data.data ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contact.id]);

  const handleCall = async () => {
    if (!contact.phone) {
      toast.error('Contact has no phone number');
      return;
    }
    setCalling(true);
    try {
      const res = await voiceCallService.initiate({ to: contact.phone, contactId: contact.id });
      toast.success('Call initiated');
      router.push(`/voice/calls/${res.data.data.id}`);
    } catch {
      toast.error('Failed to initiate call');
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void handleCall()}
        disabled={calling || !contact.phone}
        className="inline-flex items-center gap-2 rounded-lg bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {calling ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
        Call Now
      </button>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No call history.</p>
      ) : (
        <div className="space-y-3">
          {items.map((call) => (
            <div key={call.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between">
                <p className="font-medium">
                  {call.direction} · {call.status}
                </p>
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
      )}
    </div>
  );
}
