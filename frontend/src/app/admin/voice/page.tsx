"use client";

import Link from 'next/link';
import {
  Phone, ArrowRight, Hash, Mic, BarChart3,
  Settings, Clock, TrendingUp, CheckCircle2
} from 'lucide-react';

const VOICE_MODULES = [
  { label: 'Phone Numbers', href: '/admin/voice/numbers', icon: Hash, desc: 'Manage voice number inventory', color: 'text-indigo-400', bg: 'bg-indigo-500/10', stat: '4 Numbers' },
  { label: 'Call Recordings', href: '/voice/logs', icon: Mic, desc: 'Call logs and recordings', color: 'text-blue-400', bg: 'bg-blue-500/10', stat: '1,204 Calls' },
  { label: 'Transcripts', href: '/voice/transcripts', icon: BarChart3, desc: 'AI call transcripts', color: 'text-emerald-400', bg: 'bg-emerald-500/10', stat: '98%' },
  { label: 'Voice Analytics', href: '/analytics/voice', icon: TrendingUp, desc: 'Call volume and performance', color: 'text-amber-400', bg: 'bg-amber-500/10', stat: '' },
  { label: 'Voice Settings', href: '/voice/settings', icon: Settings, desc: 'IVR and routing config', color: 'text-gray-400', bg: 'bg-gray-500/10', stat: '' },
];

const LIVE_STATS = [
  { label: 'Numbers Active', value: '4', icon: Hash, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Calls Today', value: '84', icon: Phone, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Avg Duration', value: '4m 12s', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Connect Rate', value: '91%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function AdminVoicePage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Voice Engine Online</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Voice Admin</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Voice Channel Management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {LIVE_STATS.map(s => (
          <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 hover:bg-white/[0.04] transition-all">
            <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Voice Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VOICE_MODULES.map(mod => (
            <Link key={mod.href} href={mod.href}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}>
                  <mod.icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                {mod.stat && <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{mod.stat}</span>}
              </div>
              <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors mb-1">{mod.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{mod.desc}</p>
              <div className="flex items-center gap-1 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-400" /> Recently Assigned Numbers
        </h2>
        <div className="space-y-3">
          {[
            { number: '+1 (415) 555-0192', label: 'Main Sales Line', country: 'US', status: 'ACTIVE' },
            { number: '+1 (800) 555-0847', label: 'Customer Support', country: 'US', status: 'ACTIVE' },
            { number: '+44 20 7946 0839', label: 'UK Office', country: 'UK', status: 'ACTIVE' },
            { number: '+91 98765 12345', label: 'India Line', country: 'IN', status: 'PENDING' },
          ].map(n => (
            <div key={n.number} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-mono text-white">{n.number}</span>
                <span className="text-xs text-gray-500">{n.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 uppercase">{n.country}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${n.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{n.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
