"use client";

import { motion } from 'framer-motion';
import { FlowBuilder } from '@/components/FlowBuilder/FlowBuilder';
import { Settings, Save, Play, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function VoiceFlowsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Header */}
      <div className="px-8 py-4 bg-white dark:bg-[#0b0f19] border-b border-gray-200 dark:border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/voice/campaigns" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Lead Qualification Flow
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">Published</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Created by AI Assistant • Last edited 2 mins ago</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            Config
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all">
            <Play className="w-4 h-4" />
            Test Flow
          </button>
          <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]">
            <Save className="w-4 h-4" />
            Save & Publish
          </button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 p-6 bg-gray-50 dark:bg-[#0b0f19]/50 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full"
        >
          <FlowBuilder />
        </motion.div>
      </div>
    </div>
  );
}
