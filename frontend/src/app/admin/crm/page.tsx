'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Target,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  BookOpen,
  Package,
  Search,
  Settings,
  HeadphonesIcon,
  Activity,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  analyticsService,
  type AnalyticsOverview,
  type CrmAnalytics,
} from '@/services/analytics.service';

const CRM_MODULES = [
  {
    label: 'Contacts',
    href: '/admin/crm/contacts',
    icon: Users,
    desc: 'Manage all contacts',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    statKey: 'contacts' as const,
  },
  {
    label: 'Companies',
    href: '/admin/crm/companies',
    icon: Building2,
    desc: 'Company records',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    label: 'Deals',
    href: '/admin/crm/deals',
    icon: Target,
    desc: 'Active deals & pipeline',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    statKey: 'openDeals' as const,
  },
  {
    label: 'Leads',
    href: '/admin/crm/leads',
    icon: TrendingUp,
    desc: 'Lead management',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    statKey: 'leads' as const,
  },
  {
    label: 'Dashboard',
    href: '/admin/crm/dashboard',
    icon: BarChart3,
    desc: 'CRM analytics overview',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    label: 'Emails',
    href: '/admin/crm/emails',
    icon: Mail,
    desc: 'Email activity',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    label: 'Inbox',
    href: '/admin/crm/inbox',
    icon: MessageSquare,
    desc: 'Omnichannel inbox',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    label: 'Documents',
    href: '/admin/crm/documents',
    icon: FileText,
    desc: 'Document library',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    label: 'Products',
    href: '/admin/crm/products',
    icon: Package,
    desc: 'Product catalog',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    label: 'Quotes',
    href: '/admin/crm/quotes',
    icon: DollarSign,
    desc: 'Quote management',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
  },
  {
    label: 'Knowledge Base',
    href: '/admin/crm/kb',
    icon: BookOpen,
    desc: 'Help articles',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    label: 'Support',
    href: '/admin/crm/support',
    icon: HeadphonesIcon,
    desc: 'Support tickets',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    label: 'Reports',
    href: '/admin/crm/reports',
    icon: Activity,
    desc: 'CRM reports',
    color: 'text-lime-400',
    bg: 'bg-lime-500/10',
  },
  {
    label: 'Search',
    href: '/admin/crm/search',
    icon: Search,
    desc: 'Global CRM search',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
  },
  {
    label: 'Settings',
    href: '/admin/crm/settings',
    icon: Settings,
    desc: 'CRM configuration',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
  },
];

function formatStat(value: number | undefined): string {
  if (value == null) return '';
  return value.toLocaleString();
}

export default function AdminCRMPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [crm, setCrm] = useState<CrmAnalytics | null>(null);

  useEffect(() => {
    Promise.all([analyticsService.getOverview(), analyticsService.getCrm()])
      .then(([overviewData, crmData]) => {
        setOverview(overviewData);
        setCrm(crmData);
      })
      .catch(() => {
        setOverview(null);
        setCrm(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const winRate =
    overview != null && overview.openDeals + overview.wonDeals > 0
      ? Math.round((overview.wonDeals / (overview.openDeals + overview.wonDeals)) * 100)
      : null;

  const TOP_KPIs = [
    {
      label: 'Total Contacts',
      value: overview != null ? overview.contacts.toLocaleString() : '—',
    },
    {
      label: 'Open Deals',
      value: overview != null ? overview.openDeals.toLocaleString() : '—',
    },
    {
      label: 'Pipeline Value',
      value:
        overview != null ? `$${Number(overview.pipelineValue).toLocaleString()}` : '—',
    },
    {
      label: 'Win Rate',
      value: winRate != null ? `${winRate}%` : '—',
    },
  ];

  const moduleStats: Record<string, string> = {
    contacts: formatStat(overview?.contacts ?? crm?.contacts),
    openDeals: formatStat(overview?.openDeals ?? crm?.deals),
    leads: formatStat(overview?.leads ?? crm?.leads),
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">CRM Control Center</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          Admin CRM Suite Overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TOP_KPIs.map((kpi) => (
          <div
            key={kpi.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all"
          >
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">
              {kpi.label}
            </p>
            <p className="text-2xl font-black text-white mb-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
          CRM Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CRM_MODULES.map((mod) => {
            const stat =
              'statKey' in mod && mod.statKey ? moduleStats[mod.statKey] : '';
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform`}
                  >
                    <mod.icon className={`w-4 h-4 ${mod.color}`} />
                  </div>
                  {stat && (
                    <span className="text-[10px] text-gray-600 font-black">{stat}</span>
                  )}
                </div>
                <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors mb-0.5">
                  {mod.label}
                </p>
                <p className="text-[10px] text-gray-500 leading-relaxed flex-1">{mod.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-[10px] font-black text-gray-600 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                  Open{' '}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
