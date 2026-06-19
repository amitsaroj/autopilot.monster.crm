'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { whatsappConversationService, WhatsAppMessage } from '@/services/whatsapp-conversation.service';

export default function InboxConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: phone } = use(params);
  const decodedPhone = decodeURIComponent(phone);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await whatsappConversationService.get(decodedPhone);
      setMessages(res.data.data?.messages ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [decodedPhone]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col py-4">
      <Link href="/inbox" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Inbox</Link>
      <h1 className="mb-4 text-xl font-bold">{decodedPhone}</h1>
      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.direction === 'OUTBOUND' ? 'ml-auto bg-indigo-600 text-white' : 'bg-muted'}`}>{msg.body}</div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void whatsappConversationService.send(decodedPhone, draft).then(() => { setDraft(''); void load(); }).catch(() => toast.error('Send failed')); }} className="mt-4 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" placeholder="Reply..." />
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
