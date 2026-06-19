'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquare, Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  whatsappConversationService,
  WhatsAppConversationSummary,
} from '@/services/whatsapp-conversation.service';

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<WhatsAppConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void whatsappConversationService
      .list()
      .then((res) => setConversations(res.data.data ?? []))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = conversations.filter((conversation) => {
    const haystack = `${conversation.contactName ?? ''} ${conversation.phone} ${conversation.lastMessage}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in">
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-semibold text-foreground">WhatsApp</h1>
            <Link href="/whatsapp/broadcast" className="flex items-center gap-1.5 text-xs text-[hsl(246,80%,60%)] hover:underline">
              <Send className="h-3 w-3" /> Broadcast
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            filtered.map((conversation) => (
              <Link
                key={conversation.phone}
                href={`/whatsapp/conversations/${encodeURIComponent(conversation.phone)}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">
                  {(conversation.contactName ?? conversation.phone).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {conversation.contactName ?? conversation.phone}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[hsl(246,80%,60%)] text-white text-xs flex items-center justify-center shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        </div>
      </div>
    </div>
  );
}
