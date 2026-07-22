'use client';

import { useEffect, useState } from 'react';
import { Bot, MessageSquare, Book, Cpu, Sparkles, Zap, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';

interface AiHubUsage {
  tokensUsed: number;
  cost: number;
  conversations: number;
  embeddings: number;
  periodStart?: string;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString();
}

export default function AIHubPage() {
  const [usage, setUsage] = useState<AiHubUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadUsage = () => {
    setLoading(true);
    setError(false);
    void api
      .get('/ai/usage')
      .then((response) => setUsage(parseApiData<AiHubUsage>(response)))
      .catch(() => {
        setUsage(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const quickLinks = [
    {
      label: 'AI Chat',
      desc: 'Chat with your CRM data',
      href: '/ai/chat',
      icon: MessageSquare,
      color: 'from-violet-500 to-purple-600',
    },
    {
      label: 'AI Agents',
      desc: 'Configure autonomous agents',
      href: '/ai/agents',
      icon: Bot,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Knowledge Base',
      desc: 'Upload docs for RAG',
      href: '/ai/knowledge-base',
      icon: Book,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Prompt Library',
      desc: 'Saved prompt templates',
      href: '/ai/prompts',
      icon: Cpu,
      color: 'from-orange-500 to-amber-500',
    },
    {
      label: 'AI Usage',
      desc: 'Token consumption stats',
      href: '/ai/usage',
      icon: Zap,
      color: 'from-red-500 to-rose-500',
    },
    {
      label: 'Fine-tuning',
      desc: 'Custom model training',
      href: '/ai/fine-tuning',
      icon: Sparkles,
      color: 'from-pink-500 to-fuchsia-500',
    },
  ];

  const usageCards = usage
    ? [
        { label: 'Tokens Used', value: formatTokens(usage.tokensUsed) },
        { label: 'Conversations', value: usage.conversations.toLocaleString() },
        { label: 'Embeddings', value: formatTokens(usage.embeddings) },
        { label: 'Cost', value: `$${usage.cost.toFixed(2)}` },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Hub</h1>
          <p className="page-description">Powered by GPT-4 · RAG · Vector Search</p>
        </div>
        <Link
          href="/ai/chat"
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <MessageSquare className="h-4 w-4" /> Open Chat
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group rounded-xl border border-border bg-card p-6 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-lg transition-all"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4`}
            >
              <link.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Usage This Month</h2>
          {usage?.periodStart && (
            <span className="text-xs text-muted-foreground">
              Since {new Date(usage.periodStart).toLocaleDateString()}
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Unable to load usage data.</p>
            <button
              type="button"
              onClick={loadUsage}
              className="text-sm font-medium text-[hsl(246,80%,60%)] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {usageCards.map((item) => (
              <div key={item.label} className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
