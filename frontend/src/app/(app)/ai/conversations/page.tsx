'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import { aiChatService, ConversationSummary } from '@/services/ai-chat.service';

export default function AIConversationsPage() {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aiChatService.getConversations();
        setItems(res.data ?? []);
      } catch {
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/ai" className="text-sm text-muted-foreground hover:text-foreground">← AI Hub</Link>
          <h1 className="mt-2 text-2xl font-bold">Conversations</h1>
        </div>
        <Link href="/ai/chat" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          New chat
        </Link>
      </div>

      <div className="divide-y rounded-xl border border-border bg-card">
        {items.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No conversations yet.</p>
        )}
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/ai/chat?conversationId=${item.id}`}
            className="flex items-center gap-3 p-4 hover:bg-muted/50"
          >
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="font-medium">{item.title ?? `Conversation ${item.id.slice(0, 8)}`}</p>
              <p className="text-xs text-muted-foreground">
                {item.status} · {new Date(item.updatedAt).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
