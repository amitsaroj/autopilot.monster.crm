'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  ArrowRight,
  Settings,
  Zap,
  BarChart3,
  Megaphone,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { analyticsService, type WhatsappAnalytics } from '@/services/analytics.service';

const MODULES = [
  {
    label: 'WhatsApp Profiles',
    href: '/admin/whatsapp/profiles',
    icon: Settings,
    desc: 'Manage WhatsApp Business profiles',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    label: 'Inbox',
    href: '/whatsapp/inbox',
    icon: MessageSquare,
    desc: 'Unified WhatsApp message inbox',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    label: 'Templates',
    href: '/whatsapp/templates',
    icon: Zap,
    desc: 'Approved message templates',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    label: 'Settings',
    href: '/whatsapp/settings',
    icon: Settings,
    desc: 'WhatsApp channel configuration',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
  },
  {
    label: 'Metrics',
    href: '/admin/whatsapp/metrics',
    icon: BarChart3,
    desc: 'Message performance analytics',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    label: 'Campaigns',
    href: '/admin/whatsapp/campaigns',
    icon: Megaphone,
    desc: 'Broadcast and campaign management',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

export default function AdminWhatsAppPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<WhatsappAnalytics | null>(null);

  useEffect(() => {
    analyticsService
      .getWhatsapp()
      .then((data) => setMetrics(data))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      label: 'Total Messages',
      value: metrics != null ? metrics.total.toLocaleString() : '—',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Inbound',
      value: metrics != null ? metrics.inbound.toLocaleString() : '—',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Outbound',
      value: metrics != null ? metrics.outbound.toLocaleString() : '—',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Delivery Rate',
      value:
        metrics != null && metrics.total > 0
          ? `${Math.round((metrics.outbound / metrics.total) * 100)}%`
          : '—',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">WhatsApp Admin</h1>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
          WhatsApp Business Management
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4"
          >
            <div className={`w-3 h-3 rounded-full ${s.bg.replace('/10', '')}`} />
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {s.label}
              </p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-green-500/20 transition-all group flex items-center gap-5"
          >
            <div
              className={`p-4 rounded-xl ${mod.bg} group-hover:scale-110 transition-transform shrink-0`}
            >
              <mod.icon className={`w-6 h-6 ${mod.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-white group-hover:text-green-400 transition-colors mb-1">
                {mod.label}
              </h3>
              <p className="text-xs text-gray-500">{mod.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
