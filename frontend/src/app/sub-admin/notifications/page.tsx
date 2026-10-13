'use client';

import { useEffect, useState } from 'react';
import { Bell, Plus, Loader2, X, Mail, MessageSquare, Phone, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

import { subAdminNotificationsService } from '@/services/sub-admin-notifications.service';

type NotificationType = 'EMAIL' | 'SMS' | 'IN_APP' | 'WHATSAPP' | 'VOICE';

interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  status: string;
  updatedAt: string;
}

const TYPE_ICON: Record<NotificationType, typeof Mail> = {
  EMAIL: Mail,
  SMS: Smartphone,
  IN_APP: Bell,
  WHATSAPP: MessageSquare,
  VOICE: Phone,
};

const TYPES: NotificationType[] = ['EMAIL', 'SMS', 'IN_APP', 'WHATSAPP', 'VOICE'];

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? fallback) as T;
}

export default function SubAdminNotificationsPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<NotificationType>('EMAIL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await subAdminNotificationsService.findAll();
      setTemplates(unwrap<NotificationTemplate[]>(res, []));
    } catch {
      toast.error('Failed to load notification templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      await subAdminNotificationsService.create({ type, title: title.trim(), content: content.trim() });
      toast.success('Notification template saved');
      setShowForm(false);
      setTitle('');
      setContent('');
      await load();
    } catch {
      toast.error('Failed to save notification template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Per-Channel Notification Templates
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1.5">
              Channel
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const Icon = TYPE_ICON[t];
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5 transition-all ${
                      type === t
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-card border-border text-muted-foreground hover:border-blue-500/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Welcome Email"
              className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-blue-500/30"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide block mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Message body sent over this channel..."
              className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-blue-500/30"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Template
          </button>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No notification templates configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tmpl) => {
            const Icon = TYPE_ICON[tmpl.type] ?? Bell;
            return (
              <div
                key={tmpl.id}
                className="p-6 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500 transition-all">
                      <Icon className="w-5 h-5 text-blue-700 dark:text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{tmpl.title}</p>
                      <p className="text-xs text-muted-foreground">{tmpl.type}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full border text-xs font-semibold uppercase bg-card text-muted-foreground border-border">
                    {tmpl.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">{tmpl.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
