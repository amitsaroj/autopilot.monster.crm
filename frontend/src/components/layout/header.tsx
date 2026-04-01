'use client';

import { Search, Bell, Moon, Sun, Settings, ChevronDown, Command, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

export function Header({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const { toggle } = useSidebar();

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: breadcrumb / title */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-1.5 -ml-2 rounded-lg hover:bg-muted text-foreground md:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        )}
      </div>

      {/* Center: global search trigger */}
      <button
        onClick={() => {}}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors min-w-[240px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search anything...</span>
        <kbd className="ml-auto flex items-center gap-1 text-xs bg-background border border-border rounded px-1.5 py-0.5">
          <Command className="h-3 w-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(var(--brand))] rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Settings */}
        <a href="/settings" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </a>

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-7 h-7 rounded-full bg-[hsl(var(--brand))] flex items-center justify-center text-white text-xs font-bold">
            AM
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
