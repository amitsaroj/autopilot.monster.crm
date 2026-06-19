'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { whatsappBroadcastService, WhatsappBroadcast } from '@/services/whatsapp-broadcast.service';

export default function WhatsAppBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<WhatsappBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await whatsappBroadcastService.list();
      setBroadcasts(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSend = async (id: string) => {
    try {
      await whatsappBroadcastService.send(id);
      toast.success('Broadcast queued');
      void load();
    } catch {
      toast.error('Send failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this broadcast?')) return;
    try {
      await whatsappBroadcastService.remove(id);
      toast.success('Broadcast deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Broadcast</h1>
          <p className="page-description">Send broadcast messages to multiple contacts</p>
        </div>
        <Link
          href="/whatsapp/broadcast/new"
          className="text-sm text-[hsl(246,80%,60%)] hover:underline"
        >
          New broadcast
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : broadcasts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No broadcasts yet.</p>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{broadcast.name}</p>
                <p className="text-xs text-muted-foreground">
                  {broadcast.status} · {broadcast.sent}/{broadcast.total} sent
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void handleSend(broadcast.id)}
                  className="p-2 rounded-lg border border-border hover:bg-muted"
                >
                  <Send className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void handleDelete(broadcast.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
