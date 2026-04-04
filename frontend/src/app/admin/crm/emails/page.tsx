"use client";

import { useState } from 'react';
import {
  Mail, Search, Plus, Filter, Send, Eye, Trash2,
  CheckCircle2, Clock, XCircle, ArrowUpRight,
  User, Reply, Forward, Star, Archive, MoreVertical
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  status: 'SENT' | 'RECEIVED' | 'DRAFT' | 'BOUNCED';
  read: boolean;
  starred: boolean;
  createdAt: string;
  contact?: string;
}

const mockEmails: Email[] = [
  { id: '1', from: 'sarah.k@acmecorp.com', to: 'team@workspace.com', subject: 'Re: Q1 Proposal Follow-up', preview: 'Thank you for sending over the proposal. We have reviewed it with the team...', status: 'RECEIVED', read: false, starred: true, createdAt: new Date(Date.now() - 3600000).toISOString(), contact: 'Sarah Johnson' },
  { id: '2', from: 'team@workspace.com', to: 'mike@globalcorp.com', subject: 'Your Demo is Scheduled!', preview: 'Hi Mike, your product demo has been scheduled for Thursday at 2 PM EST...', status: 'SENT', read: true, starred: false, createdAt: new Date(Date.now() - 7200000).toISOString(), contact: 'Mike Chen' },
  { id: '3', from: 'team@workspace.com', to: 'priya@techstartup.io', subject: 'Welcome to Autopilot CRM', preview: 'Hi Priya, welcome aboard! Here\'s how to get started with your new CRM...', status: 'SENT', read: true, starred: false, createdAt: new Date(Date.now() - 86400000).toISOString(), contact: 'Priya Patel' },
  { id: '4', from: 'noreply@bounce.com', to: 'team@workspace.com', subject: 'Delivery Failed: Monthly Newsletter', preview: 'We were unable to deliver your message to alex@oldcompany.com...', status: 'BOUNCED', read: false, starred: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '5', from: 'team@workspace.com', to: '', subject: 'Q2 Outreach Campaign Template', preview: 'Dear [First Name], I wanted to reach out regarding...', status: 'DRAFT', read: true, starred: false, createdAt: new Date(Date.now() - 43200000).toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  SENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RECEIVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  BOUNCED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminCRMEmailsPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = emails.filter(e => {
    const matchSearch = e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const toggleStar = (id: string) => setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CRM Emails</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Workspace Email Activity Log</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Compose Email
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Received', value: emails.filter(e => e.status === 'RECEIVED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Sent', value: emails.filter(e => e.status === 'SENT').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Drafts', value: emails.filter(e => e.status === 'DRAFT').length, color: 'text-gray-400', bg: 'bg-gray-500/10' },
          { label: 'Bounced', value: emails.filter(e => e.status === 'BOUNCED').length, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${s.bg.replace('bg-', 'bg-').replace('/10', '')}`} />
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-black text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-indigo-500/30 transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search emails..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-gray-300 outline-none font-black uppercase tracking-widest">
          {['All', 'RECEIVED', 'SENT', 'DRAFT', 'BOUNCED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(email => (
          <div key={email.id} className={`p-5 rounded-2xl border transition-all group cursor-pointer hover:bg-white/[0.04] ${email.read ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-white/[0.03] border-indigo-500/20'}`}>
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20 shrink-0">
                {(email.contact || email.from).charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-3">
                    <p className={`text-sm font-bold ${email.read ? 'text-gray-300' : 'text-white'}`}>
                      {email.status === 'RECEIVED' ? email.contact || email.from : email.to || 'Draft'}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[email.status]}`}>{email.status}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleStar(email.id)}>
                      <Star className={`w-4 h-4 ${email.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-600 hover:text-amber-400'} transition-colors`} />
                    </button>
                    <span className="text-[10px] text-gray-600 font-mono">{new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className={`text-sm mb-1 ${email.read ? 'text-gray-500' : 'text-gray-300 font-medium'}`}>{email.subject}</p>
                <p className="text-xs text-gray-600 truncate">{email.preview}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Reply className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Archive className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
