'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Settings,
  Menu,
  ChevronRight,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuth } from '@/hooks/use-auth';

export function Header({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const { toggle, close, isOpen, collapsed, toggleCollapsed } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const area =
    segments[0] === 'superadmin'
      ? '/superadmin'
      : segments[0] === 'admin'
        ? '/admin'
        : segments[0] === 'sub-admin'
          ? '/sub-admin'
          : '';
  const label = title ?? segments.at(-1)?.replaceAll('-', ' ') ?? 'Workspace';

  useEffect(() => {
    if (!isOpen || !window.matchMedia('(max-width: 767px)').matches) return;
    const panel = document.getElementById('workspace-navigation');
    if (!panel) return;
    const previousFocus = document.activeElement;
    const controls = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), summary'),
      ).filter((element) => element.getClientRects().length > 0);
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key !== 'Tab') return;
      const elements = controls();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [isOpen, close]);

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/95 flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-muted md:hidden"
          aria-label="Toggle workspace navigation"
          aria-controls="workspace-navigation"
          aria-expanded={isOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-controls="workspace-navigation"
          aria-expanded={!collapsed}
          className="hidden md:block p-2 rounded-lg hover:bg-muted text-muted-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden sm:inline text-muted-foreground">Workspace</span>
          <ChevronRight className="hidden sm:block h-3 w-3 text-muted-foreground" />
          <span className="truncate capitalize font-semibold">{label}</span>
        </nav>
      </div>
      <Link
        href="/search"
        className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background text-muted-foreground text-sm w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search your workspace</span>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`${area}/notifications`}
          aria-label="Notifications"
          className="p-2.5 rounded-lg hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
        </Link>
        <button
          aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-lg hover:bg-muted"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          href={`${area}/settings`}
          aria-label="Settings"
          className="hidden sm:block p-2.5 rounded-lg hover:bg-muted"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <Link
          href={area ? `${area}/settings` : '/settings/profile'}
          aria-label="Account settings"
          className="ml-2 flex items-center gap-2 border-l border-border pl-3"
        >
          <span className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center">
            <UserRound className="w-4 h-4" />
          </span>
          <span className="hidden xl:block text-xs font-medium max-w-32 truncate">
            {typeof user?.firstName === 'string' ? user.firstName : 'My account'}
          </span>
        </Link>
      </div>
    </header>
  );
}
