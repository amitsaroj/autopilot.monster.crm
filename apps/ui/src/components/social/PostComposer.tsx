'use client';

import React, { useState } from 'react';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Send, 
  Calendar, 
  Image as ImageIcon,
  Smile,
  X,
  CheckCircle2,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SocialPlatform } from '@/services/social.service';

interface PostComposerProps {
  onSchedule: (data: any) => void;
}

const PLATFORMS = [
  { id: 'FACEBOOK', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'TWITTER', icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-50' },
  { id: 'LINKEDIN', icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export function PostComposer({ onSchedule }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['FACEBOOK']);
  const [scheduledAt, setScheduledAt] = useState('');
  const [previewPlatform, setPreviewPlatform] = useState<string>('FACEBOOK');

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
    setPreviewPlatform(id);
  };

  const handleSchedule = () => {
    if (!content.trim() || !scheduledAt) return;
    onSchedule({
      content,
      platform: selectedPlatforms[0], // Simplified for now
      scheduledAt: new Date(scheduledAt),
    });
    setContent('');
    setScheduledAt('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Editor Side */}
      <div className="bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-soft">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Create New Post</h2>
        
        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Target Platforms</label>
            <div className="flex gap-3">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition border-2",
                    selectedPlatforms.includes(p.id) 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                      : "border-gray-50 dark:border-white/5 text-gray-400"
                  )}
                >
                  <p.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Content</label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Build your brand..."
                className="w-full h-48 p-6 rounded-[24px] bg-gray-50 dark:bg-white/5 border-none text-sm font-medium resize-none focus:ring-2 ring-indigo-500/20"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button className="p-2 hover:bg-white rounded-lg text-gray-400 transition shadow-sm"><Smile className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-white rounded-lg text-gray-400 transition shadow-sm"><ImageIcon className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 px-2">
              <span className="text-[10px] font-bold text-gray-400">{content.length} characters</span>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Auto-saved</span>
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Schedule Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-xs font-bold focus:ring-2 ring-indigo-500/20"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSchedule}
                disabled={!content.trim() || !scheduledAt}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Side */}
      <div className="hidden lg:flex flex-col gap-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 block">Live Preview: {previewPlatform}</label>
        
        <div className="bg-white dark:bg-card rounded-[32px] border border-gray-100 dark:border-white/5 shadow-soft overflow-hidden">
          {/* Fake Social Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">AM</div>
              <div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white">Autopilot Monster</h4>
                <div className="flex items-center gap-1 text-[8px] font-bold text-gray-400">
                  <span>Just now</span>
                  <span>•</span>
                  <Globe className="w-2 h-2" />
                </div>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-300" />
          </div>

          {/* Post Content Preview */}
          <div className="p-6">
            <p className={cn(
              "text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed",
              !content && "text-gray-300 italic"
            )}>
              {content || "Your post preview will appear here..."}
            </p>
            
            {/* Visualizer for platform specific look and feel */}
            {previewPlatform === 'FACEBOOK' && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-8 px-2">
                <span className="text-[10px] font-bold text-gray-400">Like</span>
                <span className="text-[10px] font-bold text-gray-400">Comment</span>
                <span className="text-[10px] font-bold text-gray-400">Share</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[24px] border border-emerald-100 dark:border-emerald-800/20">
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
            <strong>Pro Tip:</strong> Posts with at least one image get 2.3x more engagement on LinkedIn.
          </p>
        </div>
      </div>
    </div>
  );
}
