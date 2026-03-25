'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  CheckCircle2, 
  Tag, 
  X, 
  UserPlus, 
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: string) => void;
  entityType: 'lead' | 'contact';
}

const STATUS_OPTIONS = [
  { label: 'New', value: 'NEW', color: 'bg-blue-500' },
  { label: 'Contacted', value: 'CONTACTED', color: 'bg-indigo-500' },
  { label: 'Qualified', value: 'QUALIFIED', color: 'bg-emerald-500' },
  { label: 'Lost', value: 'LOST', color: 'bg-rose-500' },
];

export function BulkActionBar({ 
  selectedCount, 
  onClear, 
  onDelete, 
  onUpdateStatus,
  entityType 
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900 dark:bg-card border border-white/10 text-white rounded-3xl p-4 shadow-2xl flex items-center gap-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 border-r border-white/10">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs">
                {selectedCount}
              </div>
              <span className="text-sm font-bold text-gray-300">
                {selectedCount === 1 ? `${entityType} selected` : `${entityType}s selected`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="group relative">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Update Status
                </button>
                <div className="absolute bottom-full left-0 mb-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
                  <div className="bg-gray-900 border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[160px]">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => onUpdateStatus(opt.value)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-xs font-bold transition text-left"
                      >
                        <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-sm font-bold">
                <Mail className="w-4 h-4 text-indigo-400" />
                Email
              </button>

              <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition text-sm font-bold"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>

            <button 
              onClick={onClear}
              className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
