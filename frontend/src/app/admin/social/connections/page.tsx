"use client";

import { useState } from 'react';
import { Link2, Plus, CheckCircle2, XCircle, RefreshCw, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = [
  { id: '1', name: 'LinkedIn', icon: '🔵', handle: '@autopilot-crm', status: 'CONNECTED', followers: 2400, lastSync: '5 min ago' },
  { id: '2', name: 'Twitter / X', icon: '🐦', handle: '@autopilotcrm', status: 'CONNECTED', followers: 1100, lastSync: '12 min ago' },
  { id: '3', name: 'Facebook Page', icon: '📘', handle: 'Autopilot CRM', status: 'CONNECTED', followers: 890, lastSync: '1 hour ago' },
  { id: '4', name: 'Instagram', icon: '📸', handle: '—', status: 'DISCONNECTED', followers: 0, lastSync: 'Never' },
  { id: '5', name: 'YouTube', icon: '▶️', handle: '—', status: 'DISCONNECTED', followers: 0, lastSync: 'Never' },
];

export default function AdminSocialConnectionsPage() {
  const [platforms] = useState(PLATFORMS);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social Connections</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Connected Social Accounts</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Connect Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map(p => (
          <div key={p.id} className={`p-6 rounded-2xl border transition-all ${p.status === 'CONNECTED' ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white/[0.01] border-dashed border-white/[0.08]'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h3 className="text-sm font-black text-white">{p.name}</h3>
                  <p className="text-xs text-gray-600 font-mono">{p.handle}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${p.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                {p.status}
              </span>
            </div>
            {p.status === 'CONNECTED' ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Followers</p>
                    <p className="text-base font-black text-white">{p.followers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Last Sync</p>
                    <p className="text-base font-black text-white">{p.lastSync}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-gray-400" /> Sync Now
                  </button>
                  <button className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => toast.info(`OAuth flow for ${p.name}`)}
                className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                <Link2 className="w-4 h-4" /> Connect {p.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
