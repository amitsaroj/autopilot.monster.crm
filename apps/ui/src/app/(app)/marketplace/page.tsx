import { Store, Search, Star, Download, CheckCircle, Filter } from 'lucide-react';
import Link from 'next/link';

const apps = [
  { name: 'Stripe Billing', category: 'Payments', rating: 4.9, installs: '12.4k', installed: true, desc: 'Full Stripe integration for subscriptions and payments' },
  { name: 'Slack Notifications', category: 'Messaging', rating: 4.8, installs: '8.1k', installed: true, desc: 'Send CRM alerts directly to Slack channels' },
  { name: 'HubSpot Sync', category: 'CRM', rating: 4.6, installs: '5.8k', installed: false, desc: 'Bidirectional HubSpot contact and deal sync' },
  { name: 'Calendly', category: 'Scheduling', rating: 4.7, installs: '9.2k', installed: false, desc: 'Book meetings directly from contact profiles' },
  { name: 'Google Analytics', category: 'Analytics', rating: 4.5, installs: '14k', installed: false, desc: 'Track website visitors and conversion events' },
  { name: 'OpenAI GPT-4', category: 'AI', rating: 5.0, installs: '22k', installed: true, desc: 'Advanced AI assistant and document generation' },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marketplace</h1>
          <p className="page-description">200+ integrations and plugins</p>
        </div>
        <Link href="/marketplace/installed" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <CheckCircle className="h-4 w-4" /> Installed (3)
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search marketplace..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" /> Category</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {apps.map((app) => (
          <Link key={app.name} href={`/marketplace/1`} className="group rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-md transition-all block">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl border border-border bg-muted flex items-center justify-center">
                <Store className="h-5 w-5 text-muted-foreground" />
              </div>
              {app.installed && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Installed
                </span>
              )}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">{app.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">{app.desc}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />{app.rating}</span>
              <span><Download className="h-3 w-3 inline mr-1" />{app.installs}</span>
              <span className="px-1.5 py-0.5 bg-muted rounded">{app.category}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
