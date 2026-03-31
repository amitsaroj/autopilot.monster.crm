import { Bot, MessageSquare, Book, Cpu, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AIHubPage() {
  const quickLinks = [
    { label: 'AI Chat', desc: 'Chat with your CRM data', href: '/ai/chat', icon: MessageSquare, color: 'from-violet-500 to-purple-600' },
    { label: 'AI Agents', desc: 'Configure autonomous agents', href: '/ai/agents', icon: Bot, color: 'from-blue-500 to-cyan-500' },
    { label: 'Knowledge Base', desc: 'Upload docs for RAG', href: '/ai/knowledge-base', icon: Book, color: 'from-green-500 to-emerald-500' },
    { label: 'Prompt Library', desc: 'Saved prompt templates', href: '/ai/prompts', icon: Cpu, color: 'from-orange-500 to-amber-500' },
    { label: 'AI Usage', desc: 'Token consumption stats', href: '/ai/usage', icon: Zap, color: 'from-red-500 to-rose-500' },
    { label: 'Fine-tuning', desc: 'Custom model training', href: '/ai/fine-tuning', icon: Sparkles, color: 'from-pink-500 to-fuchsia-500' },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Hub</h1>
          <p className="page-description">Powered by GPT-4 · RAG · Vector Search</p>
        </div>
        <Link href="/ai/chat" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <MessageSquare className="h-4 w-4" /> Open Chat
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.label} href={link.href} className="group rounded-xl border border-border bg-card p-6 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-4`}>
              <link.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">{link.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4">Usage This Month</h2>
        <div className="grid grid-cols-4 gap-4">
          {[{ label: 'Tokens Used', value: '1.2M' }, { label: 'Conversations', value: '842' }, { label: 'Embeddings', value: '24.8k' }, { label: 'Cost', value: '$28.40' }].map((u) => (
            <div key={u.label} className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-xl font-bold text-foreground">{u.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{u.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
