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
  Store,
  Bell,
  Settings,
  Puzzle,
  Plug,
  FileSearch,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';

interface SubAdminNavLink {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const subAdminNavItems: SubAdminNavLink[] = [
  { label: 'Overview', href: '/sub-admin', icon: LayoutDashboard },
  { label: 'Users', href: '/sub-admin/users', icon: Users },
  { label: 'Roles', href: '/sub-admin/roles', icon: ShieldCheck },
  { label: 'Permissions', href: '/sub-admin/permissions', icon: FileSearch },
  { label: 'Billing', href: '/sub-admin/billing', icon: CreditCard },
  { label: 'Usage', href: '/sub-admin/usage', icon: BarChart3 },
  { label: 'AI', href: '/sub-admin/ai', icon: Bot },
  { label: 'Voice', href: '/sub-admin/voice', icon: Phone },
  { label: 'WhatsApp', href: '/sub-admin/whatsapp', icon: MessageSquare },
  { label: 'Workflows', href: '/sub-admin/workflows', icon: Zap },
  { label: 'Marketplace', href: '/sub-admin/marketplace', icon: Store },
  { label: 'Plugins', href: '/sub-admin/plugins', icon: Puzzle },
  { label: 'Integrations', href: '/sub-admin/integrations', icon: Plug },
  { label: 'Notifications', href: '/sub-admin/notifications', icon: Bell },
  { label: 'Logs', href: '/sub-admin/logs', icon: FileSearch },
  { label: 'Settings', href: '/sub-admin/settings', icon: Settings },
];

export function SubAdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isOpen, close } = useSidebar();

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
            Sub-Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-0.5 px-3">
            {subAdminNavItems.map((item) => {
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
