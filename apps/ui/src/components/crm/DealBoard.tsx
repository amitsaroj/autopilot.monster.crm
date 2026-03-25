'use client';

import React, { useEffect, useState } from 'react';
import { 
  MoreHorizontal, 
  Calendar, 
  DollarSign, 
  Building2, 
  User,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Plus
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { dealService } from '@/services/deal.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface DealBoardProps {
  pipelineId: string;
  searchQuery?: string;
}

export const DealBoard: React.FC<DealBoardProps> = ({ pipelineId, searchQuery = '' }) => {
  const [boardData, setBoardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBoard = async () => {
    if (!pipelineId) return;
    setIsLoading(true);
    try {
      const res = await dealService.getBoard(pipelineId);
      setBoardData((res as any).data.data);
    } catch (error) {
      toast.error('Failed to load board data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [pipelineId]);

  if (isLoading) return null;

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 min-h-[70vh] scrollbar-hide">
      {boardData?.stages?.map((stage: any) => (
        <div key={stage.id} className="flex-shrink-0 w-[350px]">
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                {stage.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-500">
                {stage.deals?.length || 0}
              </span>
            </div>
            <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
              {stage.probability}%
            </div>
          </div>

          {/* Value Summary */}
          <div className="mx-4 mb-6 p-4 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-white/5 shadow-soft flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</span>
            <span className="text-sm font-black text-gray-900 dark:text-white">
              ${(stage.deals?.reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0).toLocaleString()}
            </span>
          </div>

          {/* Deal Cards Container */}
          <div className="flex flex-col gap-4 px-1 min-h-[500px]">
            <AnimatePresence mode="popLayout">
              {stage.deals?.filter((d: any) => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((deal: any) => (
                <motion.div
                  key={deal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative p-6 bg-white dark:bg-card rounded-[28px] border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-grab active:cursor-grabbing overflow-hidden"
                >
                  {/* Glass Background Sparkle */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">
                        {deal.name}
                      </h4>
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-6">
                      {deal.company && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{deal.company.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>${(deal.value || 0).toLocaleString()}</span>
                      </div>
                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-white dark:border-gray-900" />
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                        {deal.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State / Drop Target */}
            {(!stage.deals || stage.deals.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] opacity-40">
                <Sparkles className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Move Deals Here</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Stage Column */}
      <div className="flex-shrink-0 w-[350px]">
        <button className="w-full h-[140px] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[32px] flex flex-col items-center justify-center gap-2 group hover:border-indigo-500/30 hover:bg-indigo-50/10 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Add Stage</span>
        </button>
      </div>
    </div>
  );
};
