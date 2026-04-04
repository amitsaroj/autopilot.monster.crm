"use client";

import { useState } from 'react';
import {
  FileText, Plus, Search, Copy, Edit2, Trash2,
  Bot, Tag, CheckCircle2, MoreVertical, Star
} from 'lucide-react';
import { toast } from 'sonner';

interface Prompt {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  usedBy: string[];
  starred: boolean;
  updatedAt: string;
}

const mockPrompts: Prompt[] = [
  { id: '1', name: 'Sales Opener', category: 'SALES', description: 'Initial greeting and qualification opening', content: 'You are an expert sales assistant for {{company}}. Your goal is to qualify leads by understanding their pain points...', usedBy: ['Sales Qualifier Bot'], starred: true, updatedAt: new Date().toISOString() },
  { id: '2', name: 'Support Triage', category: 'SUPPORT', description: 'Categorize and prioritize support tickets', content: 'You are a support specialist. Analyze the customer\'s issue and categorize it by urgency and topic...', usedBy: ['Support Assistant'], starred: false, updatedAt: new Date().toISOString() },
  { id: '3', name: 'Lead Nurture Email', category: 'NURTURE', description: 'Follow-up sequence for warm leads', content: 'Write a personalized follow-up email for {{contact_name}} who showed interest in {{product}}...', usedBy: ['Lead Nurture Agent'], starred: true, updatedAt: new Date().toISOString() },
  { id: '4', name: 'Objection Handler', category: 'SALES', description: 'Handle common sales objections gracefully', content: 'Address the customer\'s objection about {{objection_topic}} with empathy and concrete value propositions...', usedBy: [], starred: false, updatedAt: new Date().toISOString() },
  { id: '5', name: 'Meeting Scheduler', category: 'GENERAL', description: 'Guide user to schedule a demo or meeting', content: 'Help the prospect schedule a meeting by checking available slots and confirming preferences...', usedBy: ['Sales Qualifier Bot'], starred: false, updatedAt: new Date().toISOString() },
];

const CATEGORY_COLORS: Record<string, string> = {
  SALES: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUPPORT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  NURTURE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  GENERAL: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function AdminAIPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
  const [search, setSearch] = useState('');

  const filtered = prompts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStar = (id: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, starred: !p.starred } : p));
  };

  const copyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Prompt copied to clipboard');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Prompt Library</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">System Prompts & AI Templates</p>
        </div>
        <button className="px-5 py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Prompt
        </button>
      </div>

      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 focus-within:border-purple-500/30 transition-all">
        <Search className="w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Search prompts..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(prompt => (
          <div key={prompt.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${CATEGORY_COLORS[prompt.category]}`}>
                  {prompt.category}
                </span>
                <button onClick={() => toggleStar(prompt.id)} className="transition-colors">
                  <Star className={`w-4 h-4 ${prompt.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-600 hover:text-amber-400'}`} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => copyPrompt(prompt.content)} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors mb-1">{prompt.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{prompt.description}</p>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-4">
              <p className="text-[11px] text-gray-500 font-mono leading-relaxed line-clamp-2">{prompt.content}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {prompt.usedBy.length > 0 ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] text-gray-500">{prompt.usedBy.join(', ')}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-gray-600">Not assigned to any agent</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-gray-600">{new Date(prompt.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
