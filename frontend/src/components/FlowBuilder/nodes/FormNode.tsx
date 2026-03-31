"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FileText, Database } from 'lucide-react';

export const FormNode = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-xl border-2 transition-all min-w-[200px] ${
      selected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-200 dark:border-white/10'
    } bg-white dark:bg-[#111827] ring-1 ring-black/5`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-indigo-500" />
      
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-white/5">
        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
          <FileText className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold dark:text-gray-300 uppercase tracking-wider">Form Extraction</span>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Extract Fields</label>
        <div className="flex flex-wrap gap-1">
          {['Name', 'Email', 'Company', 'Budget'].map(f => (
            <span key={f} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">
              {f}
            </span>
          ))}
        </div>
        <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center gap-2">
           <Database className="w-3 h-3 text-green-600" />
           <span className="text-[9px] font-bold text-green-700 dark:text-green-500 uppercase tracking-tighter">Auto-sync with CRM</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-indigo-500" />
    </div>
  );
};
