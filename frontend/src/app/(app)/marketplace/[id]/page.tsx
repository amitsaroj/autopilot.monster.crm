"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Store, 
  ArrowLeft, 
  CheckCircle, 
  Download, 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Clock,
  User,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/client';

interface PluginDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  author: string;
  isActive: boolean;
  isPremium: boolean;
  installed?: boolean;
}

export default function MarketplaceAppDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState<PluginDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await api.get(`/v1/marketplace/apps/${id}`);
        setApp(response.data.data);
      } catch (err) {
        setError('Failed to load application details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const handleInstall = async () => {
    if (!app) return;
    setActionLoading(true);
    try {
      if (app.installed) {
        await api.delete(`/v1/marketplace/uninstall/${id}`);
        setApp({ ...app, installed: false });
      } else {
        await api.post(`/v1/marketplace/install/${id}`);
        setApp({ ...app, installed: true });
      }
    } catch (err) {
      console.error('Installation action failed', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[hsl(246,80%,60%)]" />
        <p className="text-muted-foreground animate-pulse">Fetching app details...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-sm">{error || "The application you're looking for doesn't exist."}</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-muted-foreground">
          <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{app.name}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-3xl border-2 border-border bg-muted/30 flex items-center justify-center text-5xl shadow-inner">
              {app.icon || '🔌'}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight">{app.name}</h1>
                {app.isPremium && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md text-[10px] font-black uppercase tracking-widest">Premium</span>
                )}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{app.description}</p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <User className="h-4 w-4" /> {app.author}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" /> {app.category}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> v{app.version}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-bold border-b border-border pb-2">About this Integration</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Connect {app.name} to your AutopilotMonster CRM instance to streamline your workflows. 
                This official integration allows you to sync data bi-directionally and automate complex tasks 
                without writing a single line of code.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 list-none p-0">
                <li className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                  <span>Enterprise-grade security</span>
                </li>
                <li className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>One-click installation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pricing</span>
                <span className="font-bold text-foreground">{app.isPremium ? 'SaaS Add-on' : 'Free'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-bold ${app.installed ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {app.installed ? 'Installed' : 'Available'}
                </span>
              </div>
            </div>

            <button
              onClick={handleInstall}
              disabled={actionLoading}
              className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                app.installed 
                ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white hover:shadow-destructive/20' 
                : 'bg-[hsl(246,80%,60%)] text-white hover:bg-[hsl(246,80%,70%)] hover:shadow-[hsl(246,80%,60%)]/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : app.installed ? (
                'Uninstall Integration'
              ) : (
                <>
                  <Download className="h-4 w-4" /> Install Now
                </>
              )}
            </button>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Resources</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center justify-between p-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors group">
                  Documentation <ExternalLink className="h-3 w-3 group-hover:text-foreground" />
                </a>
                <a href="#" className="flex items-center justify-between p-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors group">
                  Support <ExternalLink className="h-3 w-3 group-hover:text-foreground" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
