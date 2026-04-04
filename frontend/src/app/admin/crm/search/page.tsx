"use client";

import { useState } from 'react';
import {
  Search, X, Users, Building2, Target, FileText,
  Clock, ArrowRight, Command, Hash, Tag, Zap
} from 'lucide-react';
import Link from 'next/link';

type ResultType = 'contact' | 'company' | 'deal' | 'quote';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  href: string;
  updatedAt?: string;
}

const mockResults: SearchResult[] = [
  { id: '1', type: 'contact', title: 'Sarah Johnson', subtitle: 'sarah.johnson@acmecorp.com · VP of Sales', href: '/admin/crm/contacts', updatedAt: '2h ago' },
  { id: '2', type: 'company', title: 'Acme Corp', subtitle: 'Enterprise · New York, USA', href: '/admin/crm/companies', updatedAt: '1d ago' },
  { id: '3', type: 'deal', title: 'Acme Corp — Enterprise Q2', subtitle: '$14,700 · Negotiation Stage', href: '/admin/crm/deals', updatedAt: '3h ago' },
  { id: '4', type: 'contact', title: 'Mike Chen', subtitle: 'mike.chen@globalcorp.com · CEO', href: '/admin/crm/contacts', updatedAt: '5h ago' },
  { id: '5', type: 'quote', title: 'QT-2025-002', subtitle: 'GlobalSales Inc · $5,980 · SENT', href: '/admin/crm/quotes', updatedAt: '2d ago' },
  { id: '6', type: 'company', title: 'TechStartup X', subtitle: 'Trial · San Francisco, USA', href: '/admin/crm/companies', updatedAt: '6h ago' },
];

const TYPE_CONFIG: Record<ResultType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  contact: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Contact' },
  company: { icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Company' },
  deal: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Deal' },
  quote: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Quote' },
};

const RECENT = ['Sarah Johnson', 'Acme Corp Enterprise Deal', 'Lead Import March', 'QT-2025-001'];
const FILTERS = ['All', 'Contacts', 'Companies', 'Deals', 'Quotes', 'Activities'];

export default function AdminCRMSearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const results = query.length > 0 ? mockResults.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(query.toLowerCase())
  ) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">CRM Search</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Search Contacts, Companies, Deals & More</p>
      </div>

      {/* Search Box */}
      <div className="relative">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.1] focus-within:border-indigo-500/40 transition-all shadow-2xl">
          <Search className="w-6 h-6 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search contacts, companies, deals, quotes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-base text-gray-100 placeholder:text-gray-600 font-medium"
          />
          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <button onClick={() => setQuery('')} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[10px] text-gray-600 font-mono">
              <Command className="w-3 h-3" />K
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.06]'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {query.length > 0 ? (
        <div>
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">
            {results.length} Result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map(r => {
                const cfg = TYPE_CONFIG[r.type];
                return (
                  <Link key={r.id} href={r.href}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
                    <div className={`p-3 rounded-xl ${cfg.bg} shrink-0 group-hover:scale-110 transition-transform`}>
                      <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{r.title}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.updatedAt && <span className="text-[10px] text-gray-600 font-mono">{r.updatedAt}</span>}
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-sm text-gray-500 font-medium">No results found for "{query}"</p>
              <p className="text-xs text-gray-700 mt-1">Try different keywords or check filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Searches
            </p>
            <div className="space-y-2">
              {RECENT.map(r => (
                <button key={r} onClick={() => setQuery(r)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all group">
                  <Clock className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Quick Access
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <button key={type} onClick={() => setActiveFilter(cfg.label + 's')}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
                  <div className={`p-2 rounded-lg ${cfg.bg}`}><cfg.icon className={`w-4 h-4 ${cfg.color}`} /></div>
                  <span className="text-sm font-black text-white">{cfg.label}s</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
