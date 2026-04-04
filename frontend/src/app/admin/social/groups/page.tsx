"use client";

import { Users, Plus, Edit2, Trash2, MoreVertical, Globe } from 'lucide-react';

const GROUPS = [
  { id: '1', name: 'Enterprise Prospects', description: 'High-value leads from enterprise segment', members: 142, platform: 'LinkedIn', created: '2025-01-15' },
  { id: '2', name: 'SaaS Founders', description: 'Startup founders and co-founders in SaaS', members: 89, platform: 'Twitter', created: '2025-02-01' },
  { id: '3', name: 'Sales Leaders', description: 'VP Sales and Sales Directors audience', members: 234, platform: 'LinkedIn', created: '2024-12-10' },
];

export default function AdminSocialGroupsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social Groups</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Audience Segment Management</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {GROUPS.map(g => (
          <div key={g.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all">
                <Users className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-base font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{g.name}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{g.description}</p>
            <div className="flex items-center justify-between border-t border-white/[0.05] pt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Users className="w-3.5 h-3.5" />{g.members} members
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Globe className="w-3.5 h-3.5" />{g.platform}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Manage
              </button>
              <button className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <div className="p-6 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center gap-4 hover:border-indigo-500/30 transition-all group cursor-pointer min-h-[260px]">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
            <Plus className="w-7 h-7 text-gray-600 group-hover:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Create a Group</p>
            <p className="text-xs text-gray-600 mt-1">Segment your social audience</p>
          </div>
        </div>
      </div>
    </div>
  );
}
