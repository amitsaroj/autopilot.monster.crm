"use client";

import React, { useEffect, useState } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  ChevronRight,
  User,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api/client';
import { formatDistanceToNow } from 'date-fns';

interface TimelineItem {
  id: string;
  type: 'ACTIVITY' | 'NOTE' | 'TASK';
  category: string;
  subject: string;
  content?: string;
  occurredAt: string;
  ownerName?: string;
}

export const CrmTimeline: React.FC<{ entityId: string; entityType: 'contact' | 'deal' }> = ({ entityId, entityType }) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      // For now, we fetch basic activities. In a real SAE-engine, we'd have a unified timeline endpoint.
      const res = await api.get(`/crm/activities?${entityType}Id=${entityId}`);
      const activities = (res.data?.data || []).map((a: any) => ({
        id: a.id,
        type: 'ACTIVITY',
        category: a.type,
        subject: a.subject,
        content: a.description,
        occurredAt: a.occurredAt,
      }));
      
      setItems(activities.sort((a: any, b: any) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()));
    } catch (e) {
      console.error("Timeline extraction failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [entityId]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'CALL': return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'EMAIL': return <Mail className="w-4 h-4 text-blue-400" />;
      case 'MEETING': return <Calendar className="w-4 h-4 text-violet-400" />;
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-6 animate-pulse">
       {[1,2,3].map(i => (
         <div key={i} className="h-24 bg-white/5 rounded-3xl border border-white/5" />
       ))}
    </div>
  );

  return (
    <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5 before:rounded-full">
      {items.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[40px]">
           <Clock className="w-10 h-10 text-gray-700 mx-auto mb-4 opacity-20" />
           <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No historical vectors detected</p>
        </div>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="relative pl-12 group animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
           {/* Timeline Node */}
           <div className="absolute left-0 top-1 w-10 h-10 rounded-2xl bg-[#0b0f19] border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-indigo-500/30 transition-all z-10">
              {getIcon(item.category)}
           </div>

           {/* Content Card */}
           <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all shadow-soft flex flex-col gap-3 group/card relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl group-hover/card:bg-indigo-500/5 transition-colors" />
              
              <div className="flex justify-between items-start relative z-10">
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/5 border border-indigo-500/10">
                          {item.category}
                       </span>
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">
                          {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
                       </span>
                    </div>
                    <h4 className="text-sm font-black text-white group-hover/card:text-indigo-400 transition-colors uppercase tracking-tight">{item.subject}</h4>
                 </div>
                 <button className="p-2 text-gray-600 hover:text-white transition opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                 </button>
              </div>

              {item.content && (
                <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-2xl">
                   {item.content}
                </p>
              )}

              <div className="flex items-center gap-3 pt-3 mt-1 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                       <User className="w-3 h-3 text-indigo-400" />
                    </div>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Autonomous Executor</span>
                 </div>
                 <div className="flex items-center gap-2 ml-auto">
                    <Zap className="w-3.5 h-3.5 text-amber-500/50" />
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Real-time Sync</span>
                 </div>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
};
