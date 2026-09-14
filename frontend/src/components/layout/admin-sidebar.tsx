'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Bot,
  Phone,
  MessageSquare,
  Zap,
  Share2,
  LifeBuoy,
  Store,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';
import { usePermission } from '@/hooks/use-permission';

interface AdminNavChild {
  label: string;
  href: string;
}

interface AdminNavGroup {
  label: string;
  icon: typeof LayoutDashboard;
  resources: string[];
  children: AdminNavChild[];
}

interface AdminNavLink {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

type AdminNavItem = AdminNavGroup | AdminNavLink;

const adminNavItems: AdminNavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  {
    label: 'CRM',
    icon: Users,
    resources: ['crm'],
    children: [
      { label: 'Control Center', href: '/admin/crm' },
      { label: 'Dashboard', href: '/admin/crm/dashboard' },
      { label: 'Contacts', href: '/admin/crm/contacts' },
      { label: 'Companies', href: '/admin/crm/companies' },
      { label: 'Leads', href: '/admin/crm/leads' },
      { label: 'Deals', href: '/admin/crm/deals' },
      { label: 'Pipelines', href: '/admin/crm/pipelines' },
      { label: 'Products', href: '/admin/crm/products' },
      { label: 'Quotes', href: '/admin/crm/quotes' },
      { label: 'Tasks', href: '/admin/crm/tasks' },
      { label: 'Activities', href: '/admin/crm/activities' },
      { label: 'Notes', href: '/admin/crm/notes' },
      { label: 'Documents', href: '/admin/crm/documents' },
      { label: 'Emails', href: '/admin/crm/emails' },
      { label: 'Inbox', href: '/admin/crm/inbox' },
      { label: 'Search', href: '/admin/crm/search' },
      { label: 'Reports', href: '/admin/crm/reports' },
      { label: 'Analytics Overview', href: '/admin/crm/analytics' },
      { label: 'Growth Funnel', href: '/admin/crm/analytics/leads' },
      { label: 'Conversion Funnel', href: '/admin/crm/analytics/pipeline' },
      { label: 'Campaigns', href: '/admin/crm/campaigns' },
      { label: 'Email Campaigns', href: '/admin/crm/campaigns/email' },
      { label: 'SMS Campaigns', href: '/admin/crm/campaigns/sms' },
      { label: 'WhatsApp Campaigns', href: '/admin/crm/campaigns/whatsapp' },
      { label: 'Knowledge Base', href: '/admin/crm/kb' },
      { label: 'Support', href: '/admin/crm/support' },
      { label: 'CRM Settings', href: '/admin/crm/settings' },
    ],
  },
  {
    label: 'Users & RBAC',
    icon: ShieldCheck,
    resources: ['users', 'rbac'],
    children: [
      { label: 'Users', href: '/admin/users' },
      { label: 'User Groups', href: '/admin/users/groups' },
      { label: 'Authority Topology', href: '/admin/users/roles' },
      { label: 'RBAC Control', href: '/admin/rbac' },
      { label: 'RBAC Roles', href: '/admin/rbac/roles' },
      { label: 'RBAC Permissions', href: '/admin/rbac/permissions' },
      { label: 'RBAC Users', href: '/admin/rbac/users' },
      { label: 'Access Audit Log', href: '/admin/rbac/audits' },
      { label: 'Security Orchestration', href: '/admin/roles' },
    ],
  },
  {
    label: 'Billing',
    icon: CreditCard,
    resources: ['billing'],
    children: [
      { label: 'Financial Orchestration', href: '/admin/billing' },
      { label: 'Billing History', href: '/admin/billing/history' },
      { label: 'Payment Methods', href: '/admin/billing/methods' },
    ],
  },
  {
    label: 'AI Suite',
    icon: Bot,
    resources: ['ai'],
    children: [
      { label: 'AI Suite', href: '/admin/ai' },
      { label: 'AI Agents', href: '/admin/ai/agents' },
      { label: 'AI Analytics', href: '/admin/ai/analytics' },
      { label: 'AI Conversations', href: '/admin/ai/conversations' },
      { label: 'AI Models', href: '/admin/ai/models' },
      { label: 'Prompt Library', href: '/admin/ai/prompts' },
      { label: 'AI Orchestration', href: '/admin/ai/settings' },
    ],
  },
  {
    label: 'Voice',
    icon: Phone,
    resources: ['voice'],
    children: [
      { label: 'Voice Admin', href: '/admin/voice' },
      { label: 'Voice Campaigns', href: '/admin/voice/campaigns' },
      { label: 'Voice Numbers', href: '/admin/voice/numbers' },
    ],
  },
  {
    label: 'WhatsApp',
    icon: MessageSquare,
    resources: ['whatsapp'],
    children: [
      { label: 'WhatsApp Admin', href: '/admin/whatsapp' },
      { label: 'WhatsApp Campaigns', href: '/admin/whatsapp/campaigns' },
      { label: 'WhatsApp Metrics', href: '/admin/whatsapp/metrics' },
      { label: 'WhatsApp Profiles', href: '/admin/whatsapp/profiles' },
    ],
  },
  {
    label: 'Workflows',
    icon: Zap,
    resources: ['workflow', 'workflows'],
    children: [
      { label: 'Workflows Admin', href: '/admin/workflows' },
      { label: 'Workflow Executions', href: '/admin/workflows/executions' },
      { label: 'Workflow Triggers', href: '/admin/workflows/triggers' },
    ],
  },
  {
    label: 'Social',
    icon: Share2,
    resources: ['social'],
    children: [
      { label: 'Social Media', href: '/admin/social' },
      { label: 'Social Connections', href: '/admin/social/connections' },
      { label: 'Social Feed', href: '/admin/social/feed' },
      { label: 'Social Groups', href: '/admin/social/groups' },
      { label: 'Media Library', href: '/admin/social/media' },
      { label: 'Social Settings', href: '/admin/social/settings' },
    ],
  },
  {
    label: 'Support',
    icon: LifeBuoy,
    resources: ['support'],
    children: [
      { label: 'Support Intelligence', href: '/admin/support' },
      { label: 'Support Tickets', href: '/admin/support/tickets' },
      { label: 'Help-Center Artifacts', href: '/admin/support/knowledge-base' },
    ],
  },
  { label: 'Marketplace', href: '/admin/marketplace', icon: Store },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  {
    label: 'Settings',
    icon: Settings,
    resources: ['settings'],
    children: [
      { label: 'Workspace Orchestration', href: '/admin/settings' },
      { label: 'Branding', href: '/admin/settings/branding' },
      { label: 'Workspace Protection', href: '/admin/settings/security' },
      { label: 'Localization', href: '/admin/settings/localization' },
      { label: 'Notification Rules', href: '/admin/settings/notifications' },
      { label: 'Backup & Restore', href: '/admin/settings/backup' },
      { label: 'API Access', href: '/admin/settings/api' },
      { label: 'Billing Settings', href: '/admin/settings/billing' },
      { label: 'Workspace Audit Ledger', href: '/admin/settings/activity-log' },
    ],
  },
];

function isGroup(item: AdminNavItem): item is AdminNavGroup {
  return 'children' in item;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isOpen, close } = useSidebar();
  const { hasAnyPermission } = usePermission();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand))] flex items-center justify-center">
            <span className="text-white text-sm font-black">AM</span>
          </div>
          <span className="text-sidebar-foreground font-bold text-sm tracking-tight">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-0.5 px-3">
            {adminNavItems.map((item) => {
              if (isGroup(item)) {
                const hide =
                  !hasAnyPermission([
                    ...item.resources.flatMap((r) => [`${r}:read`, `${r}:view`, `${r}:manage`]),
                    'admin:manage',
                  ]) && item.label !== 'Overview';
                if (hide) return null;

                const isActive = item.children.some(
                  (c) => pathname === c.href || pathname.startsWith(c.href + '/'),
                );
                return (
                  <li key={item.label}>
                    <details open={isActive} className="group">
                      <summary
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm list-none select-none transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                      </summary>
                      <ul className="mt-1 ml-7 space-y-0.5">
                        {item.children.map((child) => {
                          const childActive =
                            pathname === child.href || pathname.startsWith(child.href + '/');
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  'block px-3 py-1.5 rounded-md text-sm transition-colors',
                                  childActive
                                    ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                                )}
                              >
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              }

              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Workspace
          </Link>
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            My Account
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500/70 hover:bg-red-500/5 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Terminate Session
          </button>
        </div>
      </aside>
    </>
  );
}
