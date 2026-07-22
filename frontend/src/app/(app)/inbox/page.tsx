'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Mail,
  Phone,
  Twitter,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  omnichannelService,
  type OmnichannelConversation,
} from '@/services/omnichannel.service';
import {
  whatsappConversationService,
  type WhatsAppConversationSummary,
} from '@/services/whatsapp-conversation.service';
import { parseApiData } from '@/lib/api/parse-response';

type InboxItem = {
  id: string;
  contact: string;
  channel: string;
  preview: string;
  status: string;
  assignee: string;
  time: string;
  unread: number;
  href: string;
};

function channelIcon(ch: string) {
  const normalized = ch.toLowerCase();
  if (normalized.includes('whatsapp')) return <MessageSquare className="h-3.5 w-3.5 text-green-500" />;
  if (normalized.includes('email')) return <Mail className="h-3.5 w-3.5 text-blue-400" />;
  if (normalized.includes('phone') || normalized.includes('voice')) {
    return <Phone className="h-3.5 w-3.5 text-purple-400" />;
  }
  return <Twitter className="h-3.5 w-3.5 text-sky-400" />;
}

function formatRelativeTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function contactLabel(conv: OmnichannelConversation) {
  const c = conv.contact;
  if (!c) return conv.contactId ? `Contact ${conv.contactId.slice(0, 8)}` : 'Unknown contact';
  if (c.name) return c.name;
  const full = [c.firstName, c.lastName].filter(Boolean).join(' ');
  return full || c.email || 'Unknown contact';
}

function mapOmnichannel(conversations: OmnichannelConversation[]): InboxItem[] {
  return conversations.map((c) => ({
    id: c.id,
    contact: contactLabel(c),
    channel: (c.channel || 'WEBCHAT').toLowerCase(),
    preview: typeof c.meta?.lastPreview === 'string' ? c.meta.lastPreview : c.status,
    status: c.status || 'OPEN',
    assignee:
      typeof c.meta?.assignedAgentId === 'string' ? String(c.meta.assignedAgentId) : 'Unassigned',
    time: formatRelativeTime(c.lastMessageAt),
    unread: typeof c.meta?.unreadCount === 'number' ? Number(c.meta.unreadCount) : 0,
    href: `/inbox/conversations/${c.id}`,
  }));
}

function mapWhatsApp(conversations: WhatsAppConversationSummary[]): InboxItem[] {
  return conversations.map((c) => ({
    id: c.phone,
    contact: c.contactName || c.phone,
    channel: 'whatsapp',
    preview: c.lastMessage || 'No messages',
    status: c.status || 'OPEN',
    assignee: c.assigneeId || 'Unassigned',
    time: formatRelativeTime(c.lastMessageAt),
    unread: c.unreadCount || 0,
    href: `/whatsapp/conversations/${encodeURIComponent(c.phone)}`,
  }));
}

export default function InboxPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'omnichannel' | 'whatsapp' | null>(null);
  const [items, setItems] = useState<InboxItem[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const data = await omnichannelService.getConversations();
        const list = Array.isArray(data) ? data : [];
        setItems(mapOmnichannel(list));
        setSource('omnichannel');
        return;
      } catch {
        // Omnichannel may still be unavailable; fall back to WhatsApp conversations.
      }

      const waRes = await whatsappConversationService.list();
      const waList =
        parseApiData<WhatsAppConversationSummary[]>(waRes) ??
        (Array.isArray(waRes.data) ? (waRes.data as WhatsAppConversationSummary[]) : []);
      setItems(mapWhatsApp(waList));
      setSource('whatsapp');
    } catch {
      setItems([]);
      setSource(null);
      setError('Unable to load inbox conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const assigned = items.filter((i) => i.assignee !== 'Unassigned').length;
    const unassigned = items.filter((i) => i.assignee === 'Unassigned').length;
    return {
      all: items.length,
      assigned,
      unassigned,
      mentions: items.filter((i) => i.unread > 0).length,
    };
  }, [items]);

  const filters = [
    { label: 'All conversations', count: counts.all, active: true },
    { label: 'Assigned', count: counts.assigned },
    { label: 'Unassigned', count: counts.unassigned },
    { label: 'Unread', count: counts.mentions },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in">
      <div className="w-72 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-semibold text-foreground">Inbox</h1>
            <button
              type="button"
              onClick={() => void load()}
              className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Refresh inbox"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          {source && (
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
              Source: {source}
            </p>
          )}
          <div className="space-y-1">
            {filters.map((item) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  item.active
                    ? 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    item.active
                      ? 'bg-[hsl(246,80%,60%)] text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && error && (
            <div className="p-4 text-sm text-muted-foreground flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground text-center">
              No conversations yet
            </div>
          )}
          {!loading &&
            items.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)] shrink-0">
                  {c.contact
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      {channelIcon(c.channel)}
                      <span className="text-sm font-medium text-foreground truncate">{c.contact}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.preview}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[hsl(246,80%,60%)] text-white text-xs flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </Link>
            ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Select a conversation</p>
        </div>
      </div>
    </div>
  );
}
