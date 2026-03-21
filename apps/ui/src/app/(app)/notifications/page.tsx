import { Bell, CheckCheck, MoreHorizontal, Settings } from 'lucide-react';
import Link from 'next/link';

const notifications = [
  { title: 'New deal assigned to you', body: 'GlobalInc CRM Migration — $92k deal', time: '2m ago', read: false, type: 'deal' },
  { title: 'Task due today', body: 'Follow up with TechCorp — 3:00 PM', time: '1h ago', read: false, type: 'task' },
  { title: 'Lead score updated', body: 'Acme Corp scored 92 — marked as hot lead', time: '2h ago', read: true, type: 'lead' },
  { title: 'Invoice paid', body: 'StartupXYZ paid $4,800 — Invoice #1042', time: '4h ago', read: true, type: 'billing' },
  { title: 'Workflow error', body: 'Abandoned Chat Follow-up failed — 5 errors', time: '6h ago', read: true, type: 'error' },
  { title: 'New team member', body: 'Alex Kim joined the workspace', time: '1d ago', read: true, type: 'team' },
];

const typeColors: Record<string, string> = {
  deal: 'bg-green-500/10 text-green-500',
  task: 'bg-blue-500/10 text-blue-400',
  lead: 'bg-purple-500/10 text-purple-400',
  billing: 'bg-yellow-500/10 text-yellow-500',
  error: 'bg-red-500/10 text-red-500',
  team: 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]',
};

export default function NotificationsPage() {
  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">2 unread notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
          <Link href="/notifications/settings" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {notifications.map((n, i) => (
          <div key={i} className={`flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors ${!n.read ? 'bg-[hsl(246,80%,60%)]/5' : ''}`}>
            {!n.read && <div className="w-2 h-2 rounded-full bg-[hsl(246,80%,60%)] mt-2 shrink-0" />}
            {n.read && <div className="w-2 h-2 mt-2 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-sm font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[n.type]}`}>{n.type}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
              </div>
            </div>
            <button className="p-1 rounded hover:bg-muted transition-colors mt-1"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
