'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  ThumbsUp,
  Eye,
  Edit2,
  Trash2,
  Star,
  Tag,
  Clock,
  User,
  ChevronRight,
  FileText,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { supportService, type KnowledgeArticle } from '@/services/support.service';

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  ARCHIVED: 'bg-gray-500/10 text-muted-foreground border-gray-500/20',
};

export default function AdminCRMKnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await supportService.getArticles();
        setArticles(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load articles');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.category ?? '').toLowerCase().includes(search.toLowerCase()),
  );

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
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            CRM Help Center & Documentation
          </p>
        </div>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Articles', value: articles.length, icon: FileText },
          {
            label: 'Published',
            value: articles.filter((a) => a.status === 'PUBLISHED').length,
            icon: Star,
          },
          {
            label: 'Total Views',
            value: articles.reduce((s, a) => s + a.views, 0).toLocaleString(),
            icon: Eye,
          },
          {
            label: 'Avg Views',
            value: articles.length
              ? Math.round(articles.reduce((s, a) => s + a.views, 0) / articles.length)
              : 0,
            icon: ThumbsUp,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-card border border-border flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-blue-500/10">
              <s.icon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 focus-within:border-blue-500/30 transition-all">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-600"
        />
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-card">
              {['Article', 'Category', 'Status', 'Views', 'Helpful', 'Author', ''].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map((article) => (
              <tr
                key={article.id}
                className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors mb-1">
                      {article.title}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-card text-muted-foreground uppercase tracking-wide">
                        {article.slug}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{article.category}</td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[article.status]}`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" /> {article.views.toLocaleString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{article.views}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3" /> {article.category ?? 'General'}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-white/[0.05] transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
