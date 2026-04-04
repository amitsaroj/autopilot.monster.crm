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

  const handleDragEnd = async (dealId: string, currentStageId: string, targetStageId: string) => {
    if (currentStageId === targetStageId) return;

    // Optimistic update
    const oldData = { ...boardData };
    const newBoardData = { ...boardData };
    
    const sourceStage = newBoardData.stages.find((s: any) => s.id === currentStageId);
    const targetStage = newBoardData.stages.find((s: any) => s.id === targetStageId);
    
    if (sourceStage && targetStage) {
      const dealIndex = sourceStage.deals.findIndex((d: any) => d.id === dealId);
      const [deal] = sourceStage.deals.splice(dealIndex, 1);
      targetStage.deals.push(deal);
      setBoardData(newBoardData);
    }

    try {
      await dealService.updateDeal(dealId, { stageId: targetStageId });
      toast.success('Vector transition synchronized');
    } catch (error) {
      setBoardData(oldData);
      toast.error('Protocol synchronization failed');
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex gap-6 overflow-x-auto pb-12 min-h-[75vh] scrollbar-hide perspective-1000">
      {boardData?.stages?.map((stage: any) => (
        <div key={stage.id} className="flex-shrink-0 w-[350px] group/column">
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse" />
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest italic">
                {stage.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-500 border border-transparent group-hover/column:border-indigo-500/20 transition-all">
                {stage.deals?.length || 0}
              </span>
            </div>
            <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 opacity-50">
              {stage.probability}%
            </div>
          </div>

          {/* Value Summary */}
          <div className="mx-4 mb-6 p-5 rounded-[28px] bg-white dark:bg-card border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex items-center justify-between group-hover/column:translate-y-[-2px] transition-transform">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume</span>
               <span className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">
                 ${(stage.deals?.reduce((sum: number, d: any) => sum + (Number(d.value) || 0), 0) || 0).toLocaleString()}
               </span>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500/40" />
          </div>

          {/* Deal Cards Container */}
          <div className="flex flex-col gap-5 px-1 min-h-[600px] transition-colors rounded-[40px] pb-20">
            <AnimatePresence mode="popLayout">
              {stage.deals?.filter((d: any) => d.name.toLowerCase().includes(searchQuery.toLowerCase())).map((deal: any) => (
                <motion.div
                  key={deal.id}
                  layout
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.9}
                  onDragEnd={(e, info) => {
                     // Very basic cross-column detection
                     const x = info.point.x;
                     const container = document.getElementById('board-container');
                     if (container) {
                        const columns = container.getElementsByClassName('group/column');
                        for (let i = 0; i < columns.length; i++) {
                           const rect = columns[i].getBoundingClientRect();
                           if (x >= rect.left && x <= rect.right) {
                              const targetId = boardData.stages[i].id;
                              handleDragEnd(deal.id, stage.id, targetId);
                              break;
                           }
                        }
                     }
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -5, scale: 1.02, rotate: 1 }}
                  whileDrag={{ scale: 1.05, rotate: -2, zIndex: 100, border: '1px solid rgba(99,102,241,0.5)' }}
                  className="group relative p-8 bg-white dark:bg-card rounded-[36px] border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-grab active:cursor-grabbing overflow-hidden isolate"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/15 transition-colors -z-10" />
                  
                  <div className="relative">
                    <div className="flex justify-between items-start mb-5">
                      <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {deal.name}
                      </h4>
                      <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-5 h-5 transition-transform group-hover:rotate-90" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-8">
                      {deal.company && (
                        <div className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                          <Building2 className="w-4 h-4 text-indigo-400/60" />
                          <span className="truncate">{deal.company.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm font-black text-emerald-500">
                        <DollarSign className="w-4 h-4" />
                        <span>{(Number(deal.value) || 0).toLocaleString()} <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 font-bold">USD</span></span>
                      </div>
                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-3 text-[11px] font-black text-amber-500 uppercase tracking-widest">
                          <Clock className="w-4 h-4 opacity-70" />
                          <span>Close Date: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-2">
                         <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white dark:border-gray-900 flex items-center justify-center">
                               <User className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                         </div>
                         <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Owner: Anonymous</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-500/10">
                        {deal.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State / Drop Target */}
            {(!stage.deals || stage.deals.length === 0) && (
              <div className="flex flex-col items-center justify-center py-20 px-8 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] opacity-30 group-hover/column:opacity-60 transition-opacity">
                <div className="w-16 h-16 rounded-[24px] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                   <Sparkles className="w-8 h-8 text-indigo-500/40" />
                </div>
                <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center mb-1 italic">Vacuum Phase</h5>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter text-center">Inject deal vectors into this matrix segment</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Stage Column */}
      <div className="flex-shrink-0 w-[350px]">
        <button className="w-full h-[180px] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] flex flex-col items-center justify-center gap-4 group hover:border-indigo-500/30 hover:bg-indigo-50/10 transition-all shadow-hover">
          <div className="w-14 h-14 rounded-[20px] bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-center">
             <span className="block text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Append Pipeline Phase</span>
             <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Extend conversion logic</span>
          </div>
        </button>
      </div>
    </div>
  );
};
