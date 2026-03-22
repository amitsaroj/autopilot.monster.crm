"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialColumns = [
  { 
    id: 'lead', 
    title: 'New Leads', 
    color: 'bg-blue-500', 
    items: [
      { id: '1', name: 'Acme Corp', contact: 'Tom Bradley', value: '$45,000', score: 85, phone: '+1 555-0101' },
      { id: '2', name: 'Global Inc', contact: 'Ray Gomez', value: '$12,000', score: 42, phone: '+1 555-0102' },
    ] 
  },
  { 
    id: 'qualified', 
    title: 'Qualified', 
    color: 'bg-indigo-500', 
    items: [
      { id: '3', name: 'StartupXYZ', contact: 'Lisa Park', value: '$28,000', score: 91, phone: '+1 555-0103' },
    ] 
  },
  { 
    id: 'wip', 
    title: 'In-Conversation', 
    color: 'bg-orange-500', 
    items: [
      { id: '4', name: 'Tech Solutions', contact: 'Nina White', value: '$64,000', score: 77, phone: '+1 555-0104' },
    ] 
  },
  { 
    id: 'closed', 
    title: 'Closed / Won', 
    color: 'bg-green-500', 
    items: [
      { id: '5', name: 'Future Forge', contact: 'Sam Chen', value: '$150,000', score: 99, phone: '+1 555-0105' },
    ] 
  },
];

export default function LeadsKanbanPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Lead Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 italic">Manage and track your AI-driven sales funnel.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setView('kanban')}
                className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
           </div>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
             <Plus className="w-4 h-4" />
             Add Lead
           </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[700px] scrollbar-hide">
        {initialColumns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-widest">{col.title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500">
                  {col.items.length}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {col.items.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-500 transition-colors uppercase tracking-tight text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.contact}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">{item.value}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-white/5">
                    <div className="flex -space-x-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-white dark:border-[#111827]">
                          <Phone className="w-3 h-3" />
                       </div>
                       <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 border border-white dark:border-[#111827]">
                          <Mail className="w-3 h-3" />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/5">
                       <div className={`w-1.5 h-1.5 rounded-full ${item.score > 80 ? 'bg-green-500' : item.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                       <span className="text-[10px] font-black dark:text-gray-300 tracking-widest">{item.score}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <button className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 text-gray-400 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                 <Plus className="w-4 h-4" />
                 Add Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
