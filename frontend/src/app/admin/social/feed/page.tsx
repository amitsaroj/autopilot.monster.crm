'use client';

import { useState, useEffect } from 'react';
import {
  Rss,
  Calendar,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Filter,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { socialService } from '@/services/social.service';

interface SocialPost {
  id: string;
  content: string;
  platform: string;
  status: 'PUBLISHED' | 'SCHEDULED' | 'DRAFT' | 'FAILED';
  scheduledAt?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  SCHEDULED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  DRAFT: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: 'text-blue-700 dark:text-blue-400',
  Twitter: 'text-sky-400',
  Facebook: 'text-blue-700 dark:text-blue-400',
};

export default function AdminSocialFeedPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await socialService.getPosts();
        const payload = res.data?.data ?? res.data;
        const items = Array.isArray(payload) ? payload : (payload?.data ?? []);
        setPosts(
          items.map((p: Record<string, unknown>) => ({
            id: String(p.id),
            content: String(p.content ?? p.body ?? ''),
            platform: String(p.platform ?? 'LinkedIn'),
            status: (p.status as SocialPost['status']) ?? 'DRAFT',
            scheduledAt: p.scheduledAt as string | undefined,
            likes: Number(p.likes ?? 0),
            comments: Number(p.comments ?? 0),
            shares: Number(p.shares ?? 0),
            createdAt: String(p.createdAt ?? new Date().toISOString()),
          })),
        );
      } catch {
        toast.error('Failed to load social posts');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Social Feed</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Post Scheduler & Feed Manager
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Published',
            value: posts.filter((p) => p.status === 'PUBLISHED').length,
            color: 'text-emerald-700 dark:text-emerald-400',
          },
          {
            label: 'Scheduled',
            value: posts.filter((p) => p.status === 'SCHEDULED').length,
            color: 'text-blue-700 dark:text-blue-400',
          },
          {
            label: 'Drafts',
            value: posts.filter((p) => p.status === 'DRAFT').length,
            color: 'text-muted-foreground',
          },
          {
            label: 'Total Engagement',
            value: posts.reduce((s, p) => s + p.likes + p.comments + p.shares, 0),
            color: 'text-blue-700 dark:text-blue-400',
          },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              {s.label}
            </p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${PLATFORM_COLORS[post.platform] || 'text-muted-foreground'}`}
                >
                  {post.platform}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[post.status]}`}
                >
                  {post.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                {post.status === 'SCHEDULED' && post.scheduledAt ? (
                  <>
                    <Calendar className="w-3 h-3" />
                    {new Date(post.scheduledAt).toLocaleString()}
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-4 line-clamp-2">
              {post.content}
            </p>
            {post.status === 'PUBLISHED' && (
              <div className="flex items-center gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  {post.comments}
                </span>
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  {post.shares}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
