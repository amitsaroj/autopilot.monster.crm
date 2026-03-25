'use client';

import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduledAt: string;
  status: 'DRAFT' | 'SCHEDULED' | 'POSTED' | 'FAILED';
}

interface SocialCalendarProps {
  posts: SocialPost[];
  onDelete: (id: string) => void;
}

const PLATFORM_ICONS: Record<string, any> = {
  FACEBOOK: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  TWITTER: { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-50' },
  LINKEDIN: { icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export function SocialCalendar({ posts, onDelete }: SocialCalendarProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[40px] bg-gray-50/50">
        <CalendarIcon className="w-12 h-12 mb-4 text-gray-200" />
        <h3 className="text-lg font-black text-gray-400 mb-1">No Scheduled Posts</h3>
        <p className="text-sm text-gray-400">Your social media timeline is empty. Start composing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">Scheduled Timeline</h3>
      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-white/5">
        {posts.map((post, idx) => {
          const Platform = PLATFORM_ICONS[post.platform] || { icon: Facebook, color: 'text-gray-400', bg: 'bg-gray-50' };
          
          return (
            <motion.div 
              key={post.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-white dark:bg-card border-2 border-indigo-600 flex items-center justify-center z-10">
                <Platform.icon className={cn("w-3 h-3", Platform.color)} />
              </div>

              <div className="bg-white dark:bg-card p-6 rounded-[24px] border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-lg transition group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.scheduledAt).toLocaleString()}
                    </span>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase",
                      post.status === 'POSTED' ? "bg-emerald-50 text-emerald-600" :
                      post.status === 'FAILED' ? "bg-rose-50 text-rose-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {post.status}
                    </div>
                  </div>
                  <button 
                    onClick={() => onDelete(post.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded-lg text-rose-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
