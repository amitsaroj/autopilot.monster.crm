'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Settings,
  BarChart3,
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  Brain,
  Workflow,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

const quickLinks = [
  {
    label: 'Manage Users',
    href: '/admin/users',
    icon: Users,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'CRM Dashboard',
    href: '/admin/crm/dashboard',
    icon: BarChart3,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'RBAC & Roles',
    href: '/admin/rbac',
    icon: ShieldCheck,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    label: 'AI Suite',
    href: '/admin/ai',
    icon: Brain,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    label: 'Workflows',
    href: '/admin/workflows',
    icon: Workflow,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    label: 'WhatsApp',
    href: '/admin/whatsapp',
    icon: MessageSquare,
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    color: 'text-muted-foreground',
    bg: 'bg-gray-500/10',
  },
];

export default function AdminIndexPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<'checking' | 'operational' | 'unavailable'>('checking');

  useEffect(() => {
    api
      .get('/analytics/overview')
      .then((r) => r.data)
      .then((j) => {
        if (j.data) setStats(j.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    api
      .get('/health/ready')
      .then((response) =>
        setHealth(
          parseApiData<{ status: string }>(response)?.status === 'ok'
            ? 'operational'
            : 'unavailable',
        ),
      )
      .catch(() => setHealth('unavailable'));
  }, []);

  const kpis = [
    {
      label: 'Contacts',
      value: stats?.contacts ?? '—',
      icon: Building2,
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Leads',
      value: stats?.leads ?? '—',
      icon: Users,
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Open Deals',
      value: stats?.openDeals ?? '—',
      icon: TrendingUp,
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pipeline Value',
      value:
        stats?.pipelineValue != null ? `$${Number(stats.pipelineValue).toLocaleString()}` : '—',
      icon: CreditCard,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Tenant Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
          Workspace Management Overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group flex items-center gap-4"
            >
              <div
                className={`p-3 rounded-xl ${link.bg} group-hover:scale-110 transition-transform`}
              >
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                  {link.label}
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all mt-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border border-blue-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">System Health</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {health === 'operational'
                ? 'All configured services are responding'
                : health === 'checking'
                  ? 'Checking configured services…'
                  : 'Service health could not be confirmed'}
            </p>
          </div>
          <div
            role="status"
            className={`flex items-center gap-3 px-5 py-3 border rounded-xl ${health === 'operational' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-muted border-border text-muted-foreground'}`}
          >
            {health === 'checking' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : health === 'operational' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-semibold uppercase tracking-wide">
              {health === 'operational'
                ? 'Operational'
                : health === 'checking'
                  ? 'Checking'
                  : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
