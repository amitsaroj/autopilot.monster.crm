import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';

export const ConditionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-xl rounded-xl bg-white dark:bg-[#1f2937] border-2 border-orange-500/50 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center shrink-0">
          <GitBranch className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch Logic</span>
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
        {data.label || <span className="opacity-30 italic">If sentiment is positive...</span>}
      </div>
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500 border-2 border-white dark:border-[#1f2937]" />
      
      {/* Multiple outputs for branching */}
      <div className="mt-4 flex justify-between">
        <div className="relative">
          <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1f2937]" style={{ left: '30%' }} />
          <span className="text-[10px] font-bold text-green-500 mt-2 block">YES</span>
        </div>
        <div className="relative">
          <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1f2937]" style={{ left: '70%' }} />
          <span className="text-[10px] font-bold text-red-500 mt-2 block">NO</span>
        </div>
      </div>
    </div>
  );
});
