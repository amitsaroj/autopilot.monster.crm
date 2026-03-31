'use client';

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  Loader2,
  LayoutGrid,
  Kanban,
  Filter,
  DollarSign,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { DealBoard } from '@/components/crm/DealBoard';
import { dealService } from '@/services/deal.service';
import { pipelineService } from '@/services/pipeline.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function DealsPage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pRes = await pipelineService.getPipelines();
      const pipelineList = (pRes as any).data.data || [];
      setPipelines(pipelineList);
      
      if (pipelineList.length > 0 && !selectedPipelineId) {
        setSelectedPipelineId(pipelineList[0].id);
      }
    } catch (error) {
      toast.error('Failed to load pipelines');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto py-12 px-6">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Trophy className="w-3 h-3" />
            Revenue Acceleration 
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Sales Pipeline</h1>
          <p className="text-gray-500 font-bold leading-relaxed px-1">Orchestrate high-velocity deals and visualize your revenue trajectory in real-time.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-8 bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-white/5 flex flex-col items-center min-w-[160px] shadow-soft">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Open Pipeline</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-3xl font-black text-gray-900 dark:text-white">$142.5k</span>
            </div>
          </div>
          <button className="h-[100px] px-8 bg-indigo-600 text-white rounded-[32px] font-black text-sm shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group">
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            New Deal
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white dark:bg-card/50 p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-soft">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter deals..." 
              className="w-full pl-16 pr-8 py-4 bg-gray-50 dark:bg-white/5 border-none rounded-[20px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="h-10 w-[1px] bg-gray-100 dark:bg-white/10 mx-2" />

          <select 
            className="bg-transparent border-none text-sm font-black text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
          >
            {pipelines.map(p => (
              <option key={p.id} value={p.id} className="dark:bg-indigo-900">{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
            <button className="p-2.5 bg-white dark:bg-card rounded-xl text-indigo-600 shadow-sm transition">
              <Kanban className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-gray-600 transition">
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Orchestrating Pipeline...</p>
        </div>
      ) : (
        <DealBoard pipelineId={selectedPipelineId} searchQuery={searchQuery} />
      )}
    </div>
  );
}
