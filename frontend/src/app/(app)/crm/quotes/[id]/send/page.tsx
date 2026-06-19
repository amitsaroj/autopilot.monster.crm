'use client';

import { use, useEffect, useState } from 'react';
import { Send, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { quoteService, Quote } from '@/services/quote.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function QuoteSendPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quoteService.getQuote(id);
        const data = parseApiData<Quote>(res);
        setQuote(data);
        setMessage(`Please find attached quote ${data?.number ?? ''}.`);
      } catch {
        toast.error('Failed to load quote');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      toast.error('Recipient email is required');
      return;
    }
    setSending(true);
    try {
      await quoteService.sendQuote(id, { to, message });
      toast.success('Quote sent');
      router.push(`/crm/quotes/${id}`);
    } catch {
      toast.error('Failed to send quote');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return <p className="p-6 text-sm text-muted-foreground">Quote not found.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/crm/quotes/${id}`} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="page-title mb-0">Send Quote</h1>
          <p className="text-xs text-muted-foreground">
            {quote.number} · {quote.currency} {quote.total.toLocaleString()}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSend(e)} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-[hsl(246,80%,60%)]" />
          Send by Email
        </h2>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">To *</label>
          <input
            required
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Message</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send Quote
        </button>
      </form>
    </div>
  );
}
