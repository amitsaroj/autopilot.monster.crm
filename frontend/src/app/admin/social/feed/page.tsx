"use client";

import { useState } from 'react';
import { Rss, Calendar, Clock, Heart, MessageSquare, Share2, Plus, Filter } from 'lucide-react';

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

const mockPosts: SocialPost[] = [
  { id: '1', content: '🚀 Excited to announce our new AI-powered CRM features! Automate your sales pipeline with intelligent lead scoring and...', platform: 'LinkedIn', status: 'PUBLISHED', likes: 142, comments: 18, shares: 34, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', content: 'Did you know our CRM integrates with 50+ tools? Connect your stack today! #SaaS #CRM #Sales', platform: 'Twitter', status: 'SCHEDULED', scheduledAt: new Date(Date.now() + 3600000).toISOString(), likes: 0, comments: 0, shares: 0, createdAt: new Date().toISOString() },
  { id: '3', content: 'Month recap: Our customers closed 38% more deals using our AI agents. Here\'s how...', platform: 'LinkedIn', status: 'DRAFT', likes: 0, comments: 0, shares: 0, createdAt: new Date().toISOString() },
  { id: '4', content: '💼 New case study: How GlobalSales Inc 3x\'d their outreach with Autopilot CRM', platform: 'Facebook', status: 'PUBLISHED', likes: 67, comments: 8, shares: 12, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn: 'text-blue-400',
  Twitter: 'text-sky-400',
  Facebook: 'text-indigo-400',
};

export default function AdminSocialFeedPage() {
  const [posts] = useState<SocialPost[]>(mockPosts);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social Feed</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Post Scheduler & Feed Manager</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Published', value: posts.filter(p => p.status === 'PUBLISHED').length, color: 'text-emerald-400' },
          { label: 'Scheduled', value: posts.filter(p => p.status === 'SCHEDULED').length, color: 'text-blue-400' },
          { label: 'Drafts', value: posts.filter(p => p.status === 'DRAFT').length, color: 'text-gray-400' },
          { label: 'Total Engagement', value: posts.reduce((s, p) => s + p.likes + p.comments + p.shares, 0), color: 'text-indigo-400' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-widest ${PLATFORM_COLORS[post.platform] || 'text-gray-400'}`}>{post.platform}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[post.status]}`}>{post.status}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-mono">
                {post.status === 'SCHEDULED' && post.scheduledAt ? (
                  <><Calendar className="w-3 h-3" />{new Date(post.scheduledAt).toLocaleString()}</>
                ) : (
                  <><Clock className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString()}</>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-2">{post.content}</p>
            {post.status === 'PUBLISHED' && (
              <div className="flex items-center gap-5 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-400" />{post.likes}</span>
                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-blue-400" />{post.comments}</span>
                <span className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-emerald-400" />{post.shares}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
