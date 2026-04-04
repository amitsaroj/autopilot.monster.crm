"use client";

import { useState } from 'react';
import { Image, Upload, Search, Trash2, Download, Filter, Eye, Video, FileText } from 'lucide-react';

const mockAssets = [
  { id: '1', name: 'product-hero.png', type: 'IMAGE', size: '2.4MB', platform: 'All', used: 8, added: '2025-02-01', preview: '🖼' },
  { id: '2', name: 'q1-results-banner.jpg', type: 'IMAGE', size: '1.8MB', platform: 'LinkedIn', used: 2, added: '2025-03-15', preview: '📊' },
  { id: '3', name: 'demo-video-30s.mp4', type: 'VIDEO', size: '18MB', platform: 'All', used: 5, added: '2025-01-20', preview: '🎬' },
  { id: '4', name: 'logo-dark.png', type: 'IMAGE', size: '120KB', platform: 'All', used: 24, added: '2024-12-01', preview: '🏷' },
  { id: '5', name: 'case-study-acme.pdf', type: 'DOC', size: '3.2MB', platform: 'LinkedIn', used: 3, added: '2025-03-01', preview: '📄' },
  { id: '6', name: 'twitter-banner.png', type: 'IMAGE', size: '890KB', platform: 'Twitter', used: 1, added: '2025-02-20', preview: '🐦' },
];

const TYPE_ICONS: Record<string, React.ElementType> = { IMAGE: Image, VIDEO: Video, DOC: FileText };

export default function AdminSocialMediaPage() {
  const [search, setSearch] = useState('');
  const filtered = mockAssets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Media Library</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Social Media Asset Management</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Asset
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(asset => {
          const Icon = TYPE_ICONS[asset.type] || Image;
          return (
            <div key={asset.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group overflow-hidden">
              <div className="h-32 bg-white/[0.03] flex items-center justify-center relative">
                <span className="text-4xl">{asset.preview}</span>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"><Download className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg bg-red-500/40 text-red-300 hover:bg-red-500/60 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-white truncate mb-1">{asset.name}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><Icon className="w-3 h-3" />{asset.type}</span>
                  <span>{asset.size}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-600 mt-1">
                  <span>{asset.platform}</span>
                  <span>Used: {asset.used}x</span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-3 hover:border-indigo-500/30 transition-all group cursor-pointer h-[200px]">
          <Upload className="w-8 h-8 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          <p className="text-xs font-black text-gray-600 group-hover:text-white transition-colors uppercase tracking-widest">Upload New</p>
        </div>
      </div>
    </div>
  );
}
