import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PhoneOff } from 'lucide-react';

export const EndNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-xl rounded-xl bg-white dark:bg-[#1f2937] border-2 border-red-500/50 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center shrink-0">
          <PhoneOff className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Conversation</span>
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
        {data.label || 'Hang up / Close Chat'}
      </div>
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1f2937]" />
    </div>
  );
});
