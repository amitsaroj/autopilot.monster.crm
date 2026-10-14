'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Shield,
  Headphones,
  TrendingUp,
  ArrowLeft,
  Plus,
  Check,
  Loader2,
  Sparkles,
  Layers,
  Rocket,
} from 'lucide-react';
import { agentService, AgentTemplate } from '@/services/agent.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AgentTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await agentService.getTemplates();
        setTemplates((res as any).data.data || []);
      } catch (error) {
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleInstall = async (id: string) => {
    setInstallingId(id);
    try {
      await agentService.installTemplate(id);
      toast.success('Agent deployed successfully');
      router.push('/crm/agents');
    } catch (error) {
      toast.error('Deployment failed');
    } finally {
      setInstallingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/crm/agents"
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-blue-600 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            AI Personality Gallery
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1 italic">
            Deploy pre-configured autonomous agents in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border shadow-soft hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-blue-500 to-pink-500" />

            <div className="p-8 pb-32">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-inner">
                  {template.role === 'SALES' ? (
                    <TrendingUp className="w-8 h-8" />
                  ) : template.role === 'SUPPORT' ? (
                    <Headphones className="w-8 h-8" />
                  ) : (
                    <Sparkles className="w-8 h-8" />
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {template.category}
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed mb-6 font-medium">
                {template.description}
              </p>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Core Capabilities
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-bold border border-emerald-100 dark:border-emerald-900/50"
                    >
                      <Check className="w-3 h-3" />
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-8 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200"
                  />
                ))}
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-900 text-xs font-bold text-muted-foreground">
                  +12
                </span>
              </div>
              <button
                onClick={() => handleInstall(template.id)}
                disabled={installingId !== null}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg',
                  installingId === template.id
                    ? 'bg-gray-200 text-muted-foreground'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20 active:scale-95',
                )}
              >
                {installingId === template.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
        >
          <div className="p-6 rounded-full bg-gray-50 dark:bg-white/5 text-muted-foreground group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-all mb-4">
            <Plus className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Custom Personality</h3>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Build a unique AI from scratch
          </p>
        </motion.button>
      </div>
    </div>
  );
}
