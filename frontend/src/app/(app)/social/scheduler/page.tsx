'use client';

import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Zap, 
  BarChart3, 
  Plus, 
  Loader2,
  Calendar,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { PostComposer } from '@/components/social/PostComposer';
import { SocialCalendar } from '@/components/social/SocialCalendar';
import { SocialAnalyticsDashboard } from '@/components/social/SocialAnalyticsDashboard';
import { socialService } from '@/services/social.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SocialSchedulerPage() {
  const [activeTab, setActiveTab] = useState<'scheduler' | 'analytics'>('scheduler');
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, analyticsRes] = await Promise.all([
        socialService.getPosts(),
        socialService.getAnalytics()
      ]);
      setPosts((postsRes as any).data.data || []);
      setAnalytics((analyticsRes as any).data.data || null);
    } catch (error) {
      toast.error('Failed to load social data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedulePost = async (data: any) => {
    try {
      await socialService.schedulePost(data);
      toast.success('Post scheduled successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to schedule post');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await socialService.deletePost(id);
      toast.success('Post removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Social Automation Active
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Social Orchestrator</h1>
          <p className="text-gray-500 font-bold leading-relaxed">Broadcast and track your brand across all major networks from a single command center.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-[20px] border border-gray-100 dark:border-white/5">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={cn(
              "px-6 py-2.5 rounded-[14px] text-xs font-black transition flex items-center gap-2",
              activeTab === 'scheduler' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Calendar className="w-4 h-4" />
            Scheduler
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "px-6 py-2.5 rounded-[14px] text-xs font-black transition flex items-center gap-2",
              activeTab === 'analytics' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>

      {activeTab === 'scheduler' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="xl:col-span-2">
            <PostComposer onSchedule={handleSchedulePost} />
          </div>
          
          <div className="xl:col-span-1">
            <SocialCalendar posts={posts} onDelete={handleDeletePost} />
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-700">
          {analytics && <SocialAnalyticsDashboard data={analytics} />}
        </div>
      )}
    </div>
  );
}
