'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Target, Briefcase, GitBranch,
  Zap, Bot, Phone, MessageSquare, Bell, BarChart3,
  HardDrive, Search, CreditCard, Settings, Store,
  Puzzle, Code, HammerIcon, ShieldCheck, Activity,
  FileText, LogOut, ChevronDown, Building2, Terminal, FileSearch
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';
import { usePermission } from '@/hooks/use-permission';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'CRM',
    icon: Users,
    children: [
      { label: 'Contacts', href: '/crm/contacts' },
      { label: 'Leads', href: '/crm/leads' },
      { label: 'Deals', href: '/crm/deals' },
      { label: 'Pipeline', href: '/crm/pipelines' },
      { label: 'Companies', href: '/crm/companies' },
      { label: 'Products', href: '/crm/products' },
      { label: 'Quotes', href: '/crm/quotes' },
      { label: 'Tasks', href: '/crm/tasks' },
      { label: 'Activities', href: '/crm/activities' },
    ],
  },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare },
  { label: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { label: 'Voice', href: '/voice', icon: Phone },
  { label: 'Workflows', href: '/workflows', icon: Zap },
  { label: 'AI', href: '/ai', icon: Bot },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Storage', href: '/storage', icon: HardDrive },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Marketplace', href: '/marketplace', icon: Store },
  { label: 'Plugins', href: '/plugins', icon: Puzzle },
  { label: 'Builder', href: '/builder', icon: HammerIcon },
  {
    label: 'Billing',
    icon: CreditCard,
    children: [
      { label: 'Overview', href: '/billing' },
      { label: 'Plans', href: '/billing/plans' },
      { label: 'Invoices', href: '/billing/invoices' },
      { label: 'Usage', href: '/billing/usage' },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Profile', href: '/settings/profile' },
      { label: 'Workspace', href: '/settings/workspace' },
      { label: 'Users', href: '/settings/users' },
      { label: 'Roles', href: '/settings/roles' },
      { label: 'API', href: '/settings/api' },
      { label: 'Integrations', href: '/settings/integrations' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();
  const { hasAnyPermission } = usePermission();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--brand))] flex items-center justify-center">
          <span className="text-white text-sm font-black">AM</span>
        </div>
        <span className="text-sidebar-foreground font-bold text-sm tracking-tight">
          AutopilotMonster
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-0.5 px-3">
          {navItems.map((item) => {
            // Simplified dynamic permission check: If resource matches a prominent route, ensure read/view
            const resource = item.href ? item.href.replace('/', '') : item.label.toLowerCase();
            const hide = !hasAnyPermission([`${resource}:read`, `${resource}:view`, `${resource}:manage`, 'admin:manage']) && !['dashboard', 'inbox', 'notifications', 'search', 'profile'].includes(resource);
            if (hide) return null;

            if ('children' in item && item.children) {
              const isActive = item.children.some((c) => pathname.startsWith(c.href));
              return (
                <li key={item.label}>
                  <details open={isActive} className="group">
                    <summary className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm list-none select-none transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                    )}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
                    </summary>
                    <ul className="mt-1 ml-7 space-y-0.5">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'block px-3 py-1.5 rounded-md text-sm transition-colors',
                              pathname === child.href || pathname.startsWith(child.href + '/')
                                ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith((item.href ?? '') + '/');
            return (
              <li key={item.label}>
                <Link
                  href={item.href ?? '#'}
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

      {/* Bottom: User & SuperAdmin section */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        {user?.role === 'SUPER_ADMIN' && (
          <details className="group mb-2">
            <summary className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-[10px] font-black uppercase tracking-widest text-brand hover:bg-brand/5 list-none select-none transition-all">
              <ShieldCheck className="h-4 w-4" />
              <span className="flex-1">SuperAdmin Command</span>
              <ChevronDown className="h-3 w-3 group-open:rotate-180 transition-transform" />
            </summary>
            <ul className="mt-1 ml-7 space-y-0.5 pb-2">
              {[
                { label: 'Control Center', href: '/superadmin', icon: LayoutDashboard },
                { label: 'Tenants', href: '/superadmin/tenants', icon: Building2 },
                { label: 'Marketplace', href: '/superadmin/marketplace', icon: Store },
                { label: 'Global Billing', href: '/superadmin/subscriptions', icon: CreditCard },
                { label: 'System Health', href: '/superadmin/metrics', icon: Activity },
                { label: 'Audit Logs', href: '/superadmin/logs/audit', icon: FileSearch },
                { label: 'Broadcasts', href: '/superadmin/notifications', icon: Bell },
                { label: 'Domain Events', href: '/superadmin/events', icon: Terminal },
                { label: 'Infrastructure', href: '/superadmin/settings', icon: Settings },
              ].map((sub) => (
                <li key={sub.href}>
                  <Link
                    href={sub.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tighter transition-all',
                      pathname === sub.href ? 'bg-brand/10 text-brand' : 'text-sidebar-foreground/60 hover:text-brand hover:bg-brand/5'
                    )}
                  >
                    <sub.icon className="h-3 w-3" />
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
        <Link href="/settings/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
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
