import { MessageSquare, Send, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

const conversations = [
  { name: 'Sarah Johnson', preview: 'Thanks for sending the proposal!', time: '2m', unread: 2, avatar: 'SJ', status: 'online' },
  { name: 'Mike Chen', preview: 'Can we schedule a call tomorrow?', time: '15m', unread: 0, avatar: 'MC', status: 'offline' },
  { name: 'TechCorp Support', preview: 'Issue resolved — please confirm', time: '1h', unread: 1, avatar: 'TC', status: 'online' },
  { name: 'Emily Davis', preview: 'Attached the signed contract', time: '3h', unread: 0, avatar: 'ED', status: 'offline' },
];

export default function WhatsAppPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in">
      {/* Sidebar */}
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
            <input placeholder="Search chats..." className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <Link key={c.name} href={`/whatsapp/conversations/1`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">{c.avatar}</div>
                {c.status === 'online' && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.preview}</p>
              </div>
              {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-[hsl(246,80%,60%)] text-white text-xs flex items-center justify-center shrink-0">{c.unread}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Chat area placeholder */}
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
