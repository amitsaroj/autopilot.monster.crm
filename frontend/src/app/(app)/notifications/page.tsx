'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { notificationService } from '@/services/notification.service';
import { parseApiData } from '@/lib/api/parse-response';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  createdAt: string;
}

const typeColors: Record<string, string> = {
  EMAIL: 'bg-yellow-500/10 text-yellow-500',
  SMS: 'bg-blue-500/10 text-blue-400',
  IN_APP: 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]',
  WHATSAPP: 'bg-green-500/10 text-green-500',
  VOICE: 'bg-purple-500/10 text-purple-400',
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(parseApiData<NotificationItem[]>(res) ?? []);
    } catch {
      setNotifications([]);
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' as const } : n)),
      );
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' as const })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">
            {loading
              ? 'Loading notifications…'
              : unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={markingAll || unreadCount === 0}
            onClick={() => void handleMarkAllAsRead()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mark all read
          </button>
          <Link
            href="/settings/notifications"
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            title="Notification preferences"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 text-sm font-medium text-[hsl(246,80%,60%)] hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Activity from deals, tasks, and billing will appear here.
          </p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {notifications.map((n) => {
            const isUnread = n.status === 'UNREAD';
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => isUnread && void handleMarkAsRead(n.id)}
                className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left ${isUnread ? 'bg-[hsl(246,80%,60%)]/5' : ''}`}
              >
                {isUnread ? (
                  <div className="w-2 h-2 rounded-full bg-[hsl(246,80%,60%)] mt-2 shrink-0" />
                ) : (
                  <div className="w-2 h-2 mt-2 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[n.type] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {n.type.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {n.createdAt ? formatTime(n.createdAt) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
