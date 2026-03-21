"use client";

import { useState } from 'react';
import { Search, Filter, CheckCircle2, Link as LinkIcon, AlertCircle, ArrowUpRight, Blocks, Webhook } from 'lucide-react';
import Link from 'next/link';

type Integration = {
  id: string;
  name: string;
  category: 'Communication' | 'AI' | 'Payment' | 'CRM' | 'E-commerce';
  description: string;
  status: 'Connected' | 'Not Connected' | 'Authentication Error';
  iconStr: string;
};

const integrations: Integration[] = [
  { id: '1', name: 'Stripe', category: 'Payment', description: 'Process payments, handle SaaS subscriptions, and generate invoices automatically.', status: 'Connected', iconStr: '💳' },
  { id: '2', name: 'OpenAI', category: 'AI', description: 'Power your AI Knowledge Base, RAG, and Realtime conversational agents.', status: 'Connected', iconStr: '🧠' },
  { id: '3', name: 'Twilio', category: 'Communication', description: 'Enable programmatic AI Voice calling, SMS campaigns, and phone numbers.', status: 'Connected', iconStr: '📞' },
  { id: '4', name: 'Meta WhatsApp', category: 'Communication', description: 'Run WhatsaAs campaigns, shared inbox, and visual bot flows.', status: 'Authentication Error', iconStr: '💬' },
  { id: '5', name: 'Slack', category: 'Communication', description: 'Send automated CRM alerts and internal notifications to Slack channels.', status: 'Not Connected', iconStr: '📱' },
  { id: '6', name: 'HubSpot', category: 'CRM', description: 'Two-way sync for Contacts, Companies, and Deals pipelines.', status: 'Not Connected', iconStr: '🚀' },
  { id: '7', name: 'Shopify', category: 'E-commerce', description: 'Sync products and automate abandoned cart recovery workflows.', status: 'Not Connected', iconStr: '🛍️' },
  { id: '8', name: 'Anthropic Claude', category: 'AI', description: 'Alternative LLM powering complex data analysis and long-context processing.', status: 'Not Connected', iconStr: '🤖' },
];

const categoryColors: Record<string, string> = {
  'Communication': 'bg-blue-100 text-blue-700',
  'AI': 'bg-purple-100 text-purple-700',
  'Payment': 'bg-emerald-100 text-emerald-700',
  'CRM': 'bg-orange-100 text-orange-700',
  'E-commerce': 'bg-pink-100 text-pink-700',
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Communication', 'AI', 'Payment', 'CRM', 'E-commerce'];

  const filteredIntegrations = integrations.filter(
    (i) => (selectedCategory === 'All' || i.category === selectedCategory) &&
           (i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Workspace Settings</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Integrations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Integration Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect your favorite tools to supercharge the AutopilotMonster AI OS.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-muted text-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
          <Webhook className="w-4 h-4" /> Manage Webhooks
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search integrations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-xl bg-background shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((app) => (
          <div key={app.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center text-2xl border border-border/50 shadow-sm group-hover:scale-105 transition-transform">
                {app.iconStr}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryColors[app.category]}`}>
                {app.category}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                {app.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {app.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              
              {/* Status Indicator */}
              <div className="flex items-center gap-1.5">
                {app.status === 'Connected' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-700">Connected</span>
                  </>
                )}
                {app.status === 'Authentication Error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-red-700">Token Expired</span>
                  </>
                )}
                {app.status === 'Not Connected' && (
                  <>
                    <Blocks className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Not Connected</span>
                  </>
                )}
              </div>

              {/* Action Button */}
              {app.status === 'Connected' ? (
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  Configure
                </button>
              ) : app.status === 'Authentication Error' ? (
                <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
                  Reconnect
                </button>
              ) : (
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  Install <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}

            </div>
          </div>
        ))}
        
        {/* Custom App CTA */}
        <div className="bg-gradient-to-br from-[hsl(246,80%,60%)]/5 to-[hsl(280,80%,60%)]/10 border border-[hsl(246,80%,60%)]/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center text-center h-full group cursor-pointer border-dashed">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-[hsl(246,80%,60%)] shadow-sm mb-4 group-hover:-translate-y-1 transition-transform border border-border">
            <LinkIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground mb-2">Build Custom App</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
            Use AutopilotMonster open developer APIs to build internal connections.
          </p>
          <span className="text-sm font-bold text-[hsl(246,80%,60%)] group-hover:underline">
            View API Docs &rarr;
          </span>
        </div>

      </div>

    </div>
  );
}
