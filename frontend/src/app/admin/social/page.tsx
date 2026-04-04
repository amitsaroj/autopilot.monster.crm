"use client";

import { Globe, ArrowRight, Users, Image, Rss, Link2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const SOCIAL_MODULES = [
  { label: 'Connections', href: '/admin/social/connections', icon: Link2, desc: 'Manage connected social accounts', color: 'text-blue-400', bg: 'bg-blue-500/10', stat: '4 Connected' },
  { label: 'Social Feed', href: '/admin/social/feed', icon: Rss, desc: 'Monitor and schedule social posts', color: 'text-indigo-400', bg: 'bg-indigo-500/10', stat: '12 Scheduled' },
  { label: 'Groups', href: '/admin/social/groups', icon: Users, desc: 'Manage social audience groups', color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: '3 Groups' },
  { label: 'Media Library', href: '/admin/social/media', icon: Image, desc: 'Shared social media asset library', color: 'text-amber-400', bg: 'bg-amber-500/10', stat: '48 Assets' },
];

const PLATFORM_STATS = [
  { platform: 'LinkedIn', followers: '2.4K', posts: 18, engagement: '4.2%', connected: true },
  { platform: 'Twitter/X', followers: '1.1K', posts: 34, engagement: '2.8%', connected: true },
  { platform: 'Facebook', followers: '890', posts: 12, engagement: '3.1%', connected: true },
  { platform: 'Instagram', followers: '0', posts: 0, engagement: '—', connected: false },
];

export default function AdminSocialPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Social Media</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Omnichannel Social Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SOCIAL_MODULES.map(mod => (
          <Link key={mod.href} href={mod.href}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}>
                <mod.icon className={`w-5 h-5 ${mod.color}`} />
              </div>
              <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{mod.stat}</span>
            </div>
            <h3 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors mb-1">{mod.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{mod.desc}</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" /> Platform Overview
        </h2>
        <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                {['Platform', 'Followers', 'Posts (30d)', 'Engagement', 'Status'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {PLATFORM_STATS.map(p => (
                <tr key={p.platform} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-white">{p.platform}</td>
                  <td className="px-5 py-4 text-sm text-gray-300">{p.followers}</td>
                  <td className="px-5 py-4 text-sm text-gray-300">{p.posts}</td>
                  <td className="px-5 py-4 text-sm font-black text-emerald-400">{p.engagement}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${p.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                      {p.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
