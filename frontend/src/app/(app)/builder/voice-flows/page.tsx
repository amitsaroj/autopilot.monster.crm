'use client';

import { motion } from 'framer-motion';
import { FlowBuilder } from '@/components/FlowBuilder/FlowBuilder';
import { Settings, Save, Play, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function VoiceFlowsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-auto">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-4 bg-white dark:bg-[#0b0f19] border-b border-gray-200 dark:border-white/[0.08] flex flex-wrap gap-3 items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/voice/campaigns"
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Voice flow builder
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 uppercase">
                Draft
              </span>
            </h1>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Add and connect nodes, then save your voice flow draft.
            </p>
          </div>
        </div>

        <Link href="/voice/settings" className="product-button product-button-secondary">
          <Settings className="w-4 h-4" />
          Voice settings
        </Link>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 min-h-0 p-3 sm:p-6 bg-gray-50 dark:bg-[#0b0f19]/50 overflow-auto">
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
