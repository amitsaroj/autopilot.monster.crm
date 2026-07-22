'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Command, Loader2, AlertCircle } from 'lucide-react';
import { searchService, type SearchResult } from '@/services/search.service';

const FILTERS = [
  { label: 'All', types: 'all' },
  { label: 'Contacts', types: 'contacts' },
  { label: 'Deals', types: 'deals' },
  { label: 'Companies', types: 'companies' },
] as const;

const typeColors: Record<string, string> = {
  contact: 'bg-blue-500/10 text-blue-400',
  Contact: 'bg-blue-500/10 text-blue-400',
  deal: 'bg-green-500/10 text-green-500',
  Deal: 'bg-green-500/10 text-green-500',
  company: 'bg-emerald-500/10 text-emerald-400',
  Company: 'bg-emerald-500/10 text-emerald-400',
  lead: 'bg-red-500/10 text-red-500',
  Lead: 'bg-red-500/10 text-red-500',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [types, setTypes] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchService.search(q, types);
        setResults(res.data.data ?? []);
      } catch {
        setResults([]);
        setError('Search failed. Try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query, types]);

  const resultCountLabel = useMemo(() => {
    if (query.trim().length < 2) return 'Enter at least 2 characters';
    if (loading) return 'Searching…';
    return `Results — ${results.length} found`;
  }, [query, loading, results.length]);

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <h1 className="page-title">Global Search</h1>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          placeholder="Search contacts, deals, companies..."
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-24 py-3.5 text-base border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] shadow-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded border border-border">
          <Command className="h-3 w-3" /> K
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setTypes(f.types)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              types === f.types
                ? 'bg-[hsl(246,80%,60%)] text-white'
                : 'border border-border hover:bg-muted text-muted-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {resultCountLabel}
        </p>
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{error}</span>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">No results found</p>
        )}
        {!loading &&
          results.map((r) => {
            const href = r.url || '#';
            const color = typeColors[r.type] || 'bg-muted text-muted-foreground';
            return (
              <Link
                key={`${r.type}-${r.id}`}
                href={href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-[hsl(246,80%,60%)]/50 hover:shadow-sm transition-all"
              >
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 capitalize ${color}`}>
                  {r.type}
                </span>
                <div>
                  <p className="font-medium text-foreground">{r.title}</p>
                  {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
