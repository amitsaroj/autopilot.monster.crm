"use client";

import { useEffect, useState } from 'react';
import { Store, Search, Star, Download, CheckCircle, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/client';

interface MarketplaceApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  author: string;
  isActive: boolean;
  pricing: 'free' | 'paid' | 'freemium';
  installed?: boolean;
  rating?: number;
  installs?: string;
}

export default function MarketplacePage() {
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await api.get('/v1/marketplace/apps');
        // If API returns empty (unseeded), we'll show a friendly message or empty state
        setApps(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch apps', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-2xl font-bold">Marketplace</h1>
          <p className="page-description text-muted-foreground">Discover and install integrations for your business</p>
        </div>
        <Link href="/marketplace/installed" className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-all shadow-sm">
          <CheckCircle className="h-4 w-4" /> Installed ({apps.filter(a => a.installed).length})
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations, platforms, tools..." 
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-input rounded-xl bg-background/50 focus:bg-background focus:ring-2 focus:ring-[hsl(246,80%,60%)] transition-all outline-none" 
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-all"><Filter className="h-4 w-4" /> Category</button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(246,80%,60%)]" />
          <p className="text-muted-foreground text-sm">Loading marketplace...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No apps found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-1">Try adjusting your search or check back later for new integrations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <Link 
              key={app.id} 
              href={`/marketplace/${app.id}`} 
              className="group rounded-2xl border border-border bg-card p-6 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-xl transition-all duration-300 block relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl border border-border bg-muted/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {app.icon || '🔌'}
                </div>
                {app.installed && (
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-green-500/20">
                    <CheckCircle className="h-3 w-3" /> Installed
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">{app.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 line-clamp-2">{app.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> 
                    {app.rating || 5.0}
                  </span>
                  <span>
                    <Download className="h-3.5 w-3.5 inline mr-1" />
                    {app.installs || '0'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-muted rounded-md text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{app.category}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
