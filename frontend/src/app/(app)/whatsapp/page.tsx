'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, MessageSquare, Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  whatsappConversationService,
  WhatsAppConversationSummary,
  WhatsAppMessage,
} from '@/services/whatsapp-conversation.service';

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<WhatsAppConversationSummary[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [query, setQuery] = useState('');

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await whatsappConversationService.list();
      const items = res.data.data ?? [];
      setConversations(items);
      setActivePhone((current) => current ?? items[0]?.phone ?? null);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (phone: string) => {
    try {
      const res = await whatsappConversationService.getMessages(phone);
      setMessages(res.data.data ?? []);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (activePhone) {
      void loadMessages(activePhone);
    }
  }, [activePhone]);

  const activeConversation = conversations.find((c) => c.phone === activePhone);
  const filtered = conversations.filter((conversation) => {
    const haystack =
      `${conversation.contactName ?? ''} ${conversation.phone} ${conversation.lastMessage}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const handleSend = async () => {
    if (!activePhone || !draft.trim()) return;
    setSending(true);
    try {
      await whatsappConversationService.send(activePhone, draft.trim());
      setDraft('');
      await loadMessages(activePhone);
      await loadConversations();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!activePhone) return;
    setResolving(true);
    try {
      await whatsappConversationService.resolve(activePhone);
      toast.success('Conversation resolved');
      await loadConversations();
    } catch {
      toast.error('Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in rounded-xl border border-border overflow-hidden">
      <div className="w-80 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-semibold text-foreground">WhatsApp</h1>
            <Link
              href="/whatsapp/broadcast"
              className="flex items-center gap-1.5 text-xs text-[hsl(246,80%,60%)] hover:underline"
            >
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
              <button
                key={conversation.phone}
                type="button"
                onClick={() => setActivePhone(conversation.phone)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 ${
                  activePhone === conversation.phone ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)] shrink-0">
                  {(conversation.contactName ?? conversation.phone).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {conversation.contactName ?? conversation.phone}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(conversation.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[hsl(246,80%,60%)] text-white text-xs flex items-center justify-center shrink-0">
                    {conversation.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {!activePhone ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-semibold text-foreground leading-tight">
                  {activeConversation?.contactName ?? activePhone}
                </h2>
                {activeConversation && (
                  <span className="text-xs text-muted-foreground">{activeConversation.status}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleResolve()}
                disabled={resolving}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-md shadow-sm text-sm ${
                        msg.direction === 'OUTBOUND'
                          ? 'bg-[hsl(246,80%,60%)] text-white'
                          : 'bg-card border border-border text-foreground'
                      }`}
                    >
                      {msg.body}
                      {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                        <p className="mt-1 text-[10px] opacity-70">
                          Media: {msg.mediaUrls.join(', ')}
                        </p>
                      )}
                      <div className="text-[10px] opacity-70 text-right mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-card border-t border-border flex items-center gap-3 shrink-0">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] text-sm"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!draft.trim() || sending}
                className="w-12 h-12 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
