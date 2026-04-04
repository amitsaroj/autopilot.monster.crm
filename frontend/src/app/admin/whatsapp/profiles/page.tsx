"use client";

import { useState } from 'react';
import { MessageSquare, Plus, Edit2, CheckCircle2, Globe, Phone, User, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PROFILES = [
  { id: '1', name: 'Autopilot CRM Sales', phone: '+1 (415) 555-0192', whatsappId: '14155550192', status: 'VERIFIED', displayName: 'Autopilot CRM', category: 'Software', about: 'AI-powered CRM for modern sales teams', country: 'US', conversations: 482, lastActivity: '5 min ago' },
  { id: '2', name: 'Support Channel', phone: '+91 98765 12345', whatsappId: '919876512345', status: 'PENDING', displayName: 'Autopilot Support', category: 'Customer Service', about: '24/7 customer support for CRM users', country: 'IN', conversations: 218, lastActivity: '1 hour ago' },
];

export default function AdminWhatsAppProfilesPage() {
  const [profiles] = useState(PROFILES);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">WhatsApp Profiles</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">WhatsApp Business Account Management</p>
        </div>
        <button className="px-5 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-green-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map(profile => (
          <div key={profile.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-green-500/20 transition-all">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{profile.displayName}</h3>
                  <p className="text-xs text-gray-500">{profile.category}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${profile.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {profile.status}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5 text-gray-600" /> {profile.phone}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Globe className="w-3.5 h-3.5 text-gray-600" /> {profile.country}
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <User className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{profile.about}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Conversations</p>
                <p className="text-base font-black text-white">{profile.conversations}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Last Activity</p>
                <p className="text-xs font-black text-white">{profile.lastActivity}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-green-400" /> Configure
              </button>
              <button onClick={() => toast.error('Cannot delete last active profile')}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <div className="p-6 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center gap-4 hover:border-green-500/30 transition-all group cursor-pointer min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-green-500/10 transition-all">
            <Plus className="w-8 h-8 text-gray-600 group-hover:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Add WhatsApp Business Profile</p>
            <p className="text-xs text-gray-600 mt-1">Connect a new WhatsApp Business number</p>
          </div>
        </div>
      </div>
    </div>
  );
}
