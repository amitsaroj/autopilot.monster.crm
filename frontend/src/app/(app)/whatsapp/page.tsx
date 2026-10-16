'use client';
import Link from 'next/link';
import { MessageSquare, FileText, GitBranch, Megaphone, ArrowRight } from 'lucide-react';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import { whatsappAnalyticsService } from '@/services/whatsapp-analytics.service';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  buttonClass,
  panelClass,
} from '@/components/whatsapp/ui';
export default function WhatsAppOverview() {
  const accounts = useResource(whatsappAccountService.list);
  const analytics = useResource(whatsappAnalyticsService.read);
  const connected = accounts.data?.filter((a) => a.status === 'CONNECTED') ?? [];
  return (
    <div className="space-y-6">
      <PageHeading
        title="WhatsApp workspace"
        description="Manage customer conversations, approved outreach, and automations from one place."
        action={
          <Link className={buttonClass} href="/whatsapp/inbox">
            Open inbox <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <section className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <h2 className="font-semibold">Your sending foundation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {accounts.loading
              ? 'Checking connected accounts…'
              : accounts.error
                ? 'Account status could not be loaded.'
                : connected.length
                  ? `${connected.length} connected business ${connected.length === 1 ? 'number' : 'numbers'}. Check access before outreach.`
                  : 'Connect a Meta Business number to prepare your first automation.'}
          </p>
        </div>
        <Link href="/whatsapp/settings" className="text-sm font-medium text-primary underline">
          Manage accounts
        </Link>
      </section>
      {accounts.error && <Notice error>{accounts.error}</Notice>}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: 'Conversations',
            description:
              'Reply with window and consent checks, assign teammates, and resolve threads.',
            href: '/whatsapp/inbox',
            icon: MessageSquare,
          },
          {
            title: 'Templates',
            description: 'Create drafts and follow Meta approval before initiating messages.',
            href: '/whatsapp/templates',
            icon: FileText,
          },
          {
            title: 'Broadcasts',
            description: 'Prepare an eligible audience, preview, and control scheduled outreach.',
            href: '/whatsapp/broadcast',
            icon: Megaphone,
          },
          {
            title: 'Automation catalog',
            description: 'Install a reusable draft, configure its steps, and check readiness.',
            href: '/whatsapp/automations',
            icon: GitBranch,
          },
        ].map((item) => (
          <Link
            className={`${panelClass} group flex items-start gap-4 hover:border-primary/40`}
            href={item.href}
            key={item.href}
          >
            <item.icon className="mt-1 h-5 w-5 text-primary" />
            <div className="flex-1">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </Link>
        ))}
      </div>
      <section className="space-y-3">
        <div className="flex justify-between">
          <h2 className="font-semibold">Recorded activity</h2>
          <Link className="text-sm text-primary underline" href="/whatsapp/analytics">
            View analytics
          </Link>
        </div>
        {analytics.loading ? (
          <Loading />
        ) : analytics.error ? (
          <Notice error>{analytics.error}</Notice>
        ) : (
          analytics.data && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Total messages', analytics.data.total],
                ['Inbound', analytics.data.inbound],
                ['Delivered', analytics.data.delivered],
              ].map(([label, value]) => (
                <article className={panelClass} key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-3 text-3xl font-semibold tabular-nums">
                    {typeof value === 'number' ? value.toLocaleString() : '—'}
                  </p>
                </article>
              ))}
            </div>
          )
        )}
      </section>
      <section className={panelClass}>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Before you publish</h2>
          <StatusBadge value="READINESS_CHECKS" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect an account, record customer consent, approve required templates, and validate a
          draft. Preview does not send messages.
        </p>
      </section>
    </div>
  );
}
