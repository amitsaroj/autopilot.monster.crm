'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';
export const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
export const secondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
export const panelClass = 'rounded-xl border border-border bg-card p-5';
export function WhatsAppNav() {
  const pathname = usePathname();
  const links = [
    ['Overview', '/whatsapp'],
    ['Inbox', '/whatsapp/inbox'],
    ['Templates', '/whatsapp/templates'],
    ['Broadcasts', '/whatsapp/broadcast'],
    ['Automation', '/whatsapp/flow-builder'],
    ['Catalog', '/whatsapp/automations'],
    ['Consent', '/whatsapp/consent'],
    ['Analytics', '/whatsapp/analytics'],
    ['Accounts', '/whatsapp/settings'],
  ];
  return (
    <nav
      aria-label="WhatsApp workspace"
      className="flex flex-wrap gap-1 border-b border-border pb-3"
    >
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          aria-current={
            (href === '/whatsapp' ? pathname === href : pathname.startsWith(href))
              ? 'page'
              : undefined
          }
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${(href === '/whatsapp' ? pathname === href : pathname.startsWith(href)) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${error ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-border bg-muted/40 text-muted-foreground'}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
export function Loading() {
  return (
    <div role="status" className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading WhatsApp data…
    </div>
  );
}
export function StatusBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium">
      {value.replaceAll('_', ' ')}
    </span>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
export function errorMessage(error: unknown): string {
  const e = error as { response?: { data?: { message?: unknown } } };
  const m = e?.response?.data?.message;
  return typeof m === 'string'
    ? m
    : Array.isArray(m)
      ? m.join('; ')
      : 'Unable to complete this action. Check your connection and workspace access, then retry.';
}
export function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}
