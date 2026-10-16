'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  CreditCard,
  Bot,
  Phone,
  MessageSquare,
  Zap,
  Store,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { subAdminUsersService } from '@/services/sub-admin-users.service';
import { subAdminRolesService } from '@/services/sub-admin-roles.service';
import { subAdminUsageService } from '@/services/sub-admin-usage.service';
import { subAdminBillingService } from '@/services/sub-admin-billing.service';

function unwrap<T>(response: any, fallback: T): T {
  const payload = response?.data ?? response;
  return (payload?.data ?? payload ?? fallback) as T;
}

interface UsageSummary {
  aiTokens?: number;
  smsCount?: number;
  voiceMinutes?: number;
  storageBytes?: number;
}

const QUICK_LINKS = [
  { label: 'Users', href: '/sub-admin/users', icon: Users },
  { label: 'Roles', href: '/sub-admin/roles', icon: ShieldCheck },
  { label: 'Billing', href: '/sub-admin/billing', icon: CreditCard },
  { label: 'AI', href: '/sub-admin/ai', icon: Bot },
  { label: 'Voice', href: '/sub-admin/voice', icon: Phone },
  { label: 'WhatsApp', href: '/whatsapp/settings', icon: MessageSquare },
  { label: 'Workflows', href: '/sub-admin/workflows', icon: Zap },
  { label: 'Marketplace', href: '/sub-admin/marketplace', icon: Store },
];

export default function SubAdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [roleCount, setRoleCount] = useState(0);
  const [usage, setUsage] = useState<UsageSummary>({});
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('—');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, rolesRes, usageRes, subRes] = await Promise.all([
          subAdminUsersService.getUsers(),
          subAdminRolesService.getRoles(),
          subAdminUsageService.getUsageSummary(),
          subAdminBillingService.getSubscription(),
        ]);

        setUserCount(unwrap<any[]>(usersRes, []).length);
        setRoleCount(unwrap<any[]>(rolesRes, []).length);
        setUsage(unwrap<UsageSummary>(usageRes, {}));
        setSubscriptionStatus(unwrap<any>(subRes, {})?.status ?? '—');
      } catch {
        toast.error('Failed to load sub-admin overview');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Workspace Users', value: userCount },
    { label: 'Roles', value: roleCount },
    { label: 'Subscription', value: subscriptionStatus },
    { label: 'AI Tokens Used', value: usage.aiTokens ?? 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Sub-Admin Overview
        </h1>
        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
          Delegated Workspace Administration
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-5 rounded-2xl bg-card border border-border hover:bg-white/[0.04] hover:border-blue-500/20 transition-all flex flex-col gap-4 group"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 w-fit group-hover:bg-blue-500 transition-all">
                <link.icon className="h-5 w-5 text-blue-700 dark:text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{link.label}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
