"use client";

import { useState } from 'react';
import {
  BookOpen, Search, Plus, Filter, ThumbsUp,
  Eye, Edit2, Trash2, Star, Tag, Clock, User,
  ChevronRight, FileText, TrendingUp
} from 'lucide-react';

interface KBArticle {
  id: string;
  title: string;
  category: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  views: number;
  helpful: number;
  author: string;
  tags: string[];
  updatedAt: string;
}

const mockArticles: KBArticle[] = [
  { id: '1', title: 'Getting Started with CRM', category: 'Onboarding', status: 'PUBLISHED', views: 1240, helpful: 98, author: 'Admin', tags: ['crm', 'basics', 'onboarding'], updatedAt: new Date().toISOString() },
  { id: '2', title: 'How to Import Contacts via CSV', category: 'Data & Import', status: 'PUBLISHED', views: 892, helpful: 94, author: 'Support', tags: ['import', 'contacts', 'csv'], updatedAt: new Date().toISOString() },
  { id: '3', title: 'Setting Up AI Agents', category: 'AI & Automation', status: 'PUBLISHED', views: 542, helpful: 91, author: 'Product', tags: ['ai', 'agents', 'automation'], updatedAt: new Date().toISOString() },
  { id: '4', title: 'WhatsApp Integration Guide', category: 'Integrations', status: 'PUBLISHED', views: 348, helpful: 87, author: 'Support', tags: ['whatsapp', 'integration'], updatedAt: new Date().toISOString() },
  { id: '5', title: 'Custom Roles & Permissions', category: 'Security & Access', status: 'DRAFT', views: 0, helpful: 0, author: 'Admin', tags: ['rbac', 'roles', 'permissions'], updatedAt: new Date().toISOString() },
  { id: '6', title: 'Billing & Subscription FAQ', category: 'Billing', status: 'PUBLISHED', views: 712, helpful: 89, author: 'Finance', tags: ['billing', 'subscription', 'faq'], updatedAt: new Date().toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ARCHIVED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function AdminCRMKnowledgeBasePage() {
  const [articles] = useState<KBArticle[]>(mockArticles);
  const [search, setSearch] = useState('');

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Knowledge Base</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">CRM Help Center & Documentation</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Articles', value: articles.length, icon: FileText },
          { label: 'Published', value: articles.filter(a => a.status === 'PUBLISHED').length, icon: Star },
          { label: 'Total Views', value: articles.reduce((s, a) => s + a.views, 0).toLocaleString(), icon: Eye },
          { label: 'Avg Helpful %', value: `${Math.round(articles.filter(a => a.helpful > 0).reduce((s, a) => s + a.helpful, 0) / articles.filter(a => a.helpful > 0).length)}%`, icon: ThumbsUp },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10"><s.icon className="w-5 h-5 text-indigo-400" /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.05] bg-white/[0.02]">
              {['Article', 'Category', 'Status', 'Views', 'Helpful', 'Author', ''].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.map(article => (
              <tr key={article.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors mb-1">{article.title}</p>
                    <div className="flex gap-1 flex-wrap">
                      {article.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-600 uppercase tracking-widest">{t}</span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400">{article.category}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[article.status]}`}>{article.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-300">
                    <Eye className="w-3.5 h-3.5 text-gray-600" /> {article.views.toLocaleString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-black text-emerald-400">{article.helpful > 0 ? `${article.helpful}%` : '—'}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <User className="w-3 h-3" /> {article.author}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
