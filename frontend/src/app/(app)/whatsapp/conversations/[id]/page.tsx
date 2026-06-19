'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  whatsappConversationService,
  WhatsAppMessage,
} from '@/services/whatsapp-conversation.service';

export default function WhatsAppConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: phone } = use(params);
  const decodedPhone = decodeURIComponent(phone);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await whatsappConversationService.getMessages(decodedPhone);
      setMessages(res.data.data ?? []);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [decodedPhone]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      await whatsappConversationService.send(decodedPhone, draft.trim());
      setDraft('');
      await load();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await whatsappConversationService.resolve(decodedPhone);
      toast.success('Conversation resolved');
    } catch {
      toast.error('Failed to resolve conversation');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col py-4">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/whatsapp" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600">
          <ArrowLeft className="h-4 w-4" /> WhatsApp
        </Link>
        <button
          type="button"
          onClick={() => void handleResolve()}
          disabled={resolving}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
        </button>
      </div>
      <h1 className="mb-4 text-xl font-bold">{decodedPhone}</h1>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
        {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.direction === 'OUTBOUND' ? 'ml-auto bg-green-600 text-white' : 'bg-gray-100 text-gray-900'
            }`}
          >
            {msg.body}
            {msg.mediaUrls && msg.mediaUrls.length > 0 && (
              <p className="mt-1 text-[10px] opacity-70">Media: {msg.mediaUrls.join(', ')}</p>
            )}
            <p className="mt-1 text-[10px] opacity-70">{new Date(msg.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => void handleSend(e)} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button type="submit" disabled={sending} className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
