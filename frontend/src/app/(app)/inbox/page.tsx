import { MessageSquare, Mail, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';

const conversations = [
  { id: 1, contact: 'Sarah Johnson', channel: 'whatsapp', preview: 'Thanks for the proposal!', status: 'Open', assignee: 'You', time: '2m', tags: ['hot-lead'], unread: 2 },
  { id: 2, contact: 'Mike Chen', channel: 'email', preview: 'Following up on my inquiry...', status: 'Pending', assignee: 'Alex', time: '18m', tags: [], unread: 0 },
  { id: 3, contact: 'Emily Davis', channel: 'chat', preview: 'Is there a free trial available?', status: 'Open', assignee: 'Unassigned', time: '1h', tags: ['trial'], unread: 1 },
  { id: 4, contact: 'James Wilson', channel: 'phone', preview: 'Voicemail received', status: 'Resolved', assignee: 'Sarah', time: '3h', tags: [], unread: 0 },
];

const channelIcon = (ch: string) => {
  if (ch === 'whatsapp') return <MessageSquare className="h-3.5 w-3.5 text-green-500" />;
  if (ch === 'email') return <Mail className="h-3.5 w-3.5 text-blue-400" />;
  if (ch === 'phone') return <Phone className="h-3.5 w-3.5 text-purple-400" />;
  return <Twitter className="h-3.5 w-3.5 text-sky-400" />;
};

export default function InboxPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="font-semibold text-foreground mb-3">Inbox</h1>
          <div className="space-y-1">
            {[
              { label: 'All conversations', count: 24, active: true },
              { label: 'Assigned to me', count: 8 },
              { label: 'Unassigned', count: 6 },
              { label: 'Mentions', count: 2 },
            ].map((item) => (
              <Link key={item.label} href="/inbox/conversations" className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${item.active ? 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                {item.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.active ? 'bg-[hsl(246,80%,60%)] text-white' : 'bg-muted text-muted-foreground'}`}>{item.count}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {conversations.map((c) => (
            <Link key={c.id} href={`/inbox/conversations/${c.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
              <div className="w-9 h-9 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)] shrink-0">
                {c.contact.split(' ').map(n => n[0]).join('')}
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
                {c.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">{c.tags.map((t) => <span key={t} className="px-1.5 py-0.5 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] rounded text-xs">{t}</span>)}</div>
                )}
              </div>
              {c.unread > 0 && <span className="w-4 h-4 rounded-full bg-[hsl(246,80%,60%)] text-white text-xs flex items-center justify-center shrink-0">{c.unread}</span>}
            </Link>
          ))}
        </div>
      </div>
      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Select a conversation</p>
        </div>
      </div>
    </div>
  );
}
