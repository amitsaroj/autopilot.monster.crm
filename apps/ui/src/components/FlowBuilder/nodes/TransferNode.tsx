"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { PhoneForwarded, X } from 'lucide-react';

export const TransferNode = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-xl border-2 transition-all min-w-[200px] ${
      selected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-200 dark:border-white/10'
    } bg-white dark:bg-[#111827] ring-1 ring-black/5`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-indigo-500" />
      
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-white/5">
        <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
          <PhoneForwarded className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold dark:text-gray-300 uppercase tracking-wider">Transfer Call</span>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Transfer To</label>
        <input 
          type="text" 
          placeholder="+1234567890"
          defaultValue={data.phoneNumber}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <p className="text-[10px] text-gray-400 italic">Call will be transferred to this number immediately.</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-indigo-500" />
    </div>
  );
};
