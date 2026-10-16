'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  whatsappBroadcastService,
  type WhatsappBroadcast,
} from '@/services/whatsapp-broadcast.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  formatDate,
} from '@/components/whatsapp/ui';
export default function BroadcastsPage() {
  const broadcasts = useResource(
    async () => parseApiData<WhatsappBroadcast[]>(await whatsappBroadcastService.list()) ?? [],
    15000,
  );
  const [query, setQuery] = useState('');
  return (
    <div className="space-y-6">
      <PageHeading
        title="Broadcasts"
        description="Prepare drafts, review recipients, and control real scheduled outreach."
        action={
          <Link className={buttonClass} href="/whatsapp/broadcast/new">
            Prepare broadcast
          </Link>
        }
      />
      {broadcasts.error && <Notice error>{broadcasts.error}</Notice>}
      <div className="flex gap-3">
        <input
          aria-label="Search broadcasts"
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search broadcasts"
        />
        <button className={secondaryClass} onClick={() => void broadcasts.reload()}>
          Refresh
        </button>
      </div>
      {broadcasts.loading ? (
        <Loading />
      ) : broadcasts.data?.length ? (
        <div className="space-y-3">
          {broadcasts.data
            .filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
            .map((b) => (
              <Link
                key={b.id}
                href={`/whatsapp/broadcast/${b.id}`}
                className={`${panelClass} flex flex-wrap items-center justify-between gap-4 hover:border-primary/40`}
              >
                <div>
                  <h2 className="font-semibold">{b.name}</h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {b.sent.toLocaleString()} accepted · {b.failed.toLocaleString()} failed ·{' '}
                    {b.total.toLocaleString()} recipients
                    {b.scheduledAt ? ` · Scheduled ${formatDate(b.scheduledAt)}` : ''}
                  </p>
                  {b.approvalRequired && (
                    <p className="mt-1 text-xs font-medium text-primary">
                      Approval {b.approvalStatus.toLowerCase()}
                    </p>
                  )}
                </div>
                <StatusBadge value={b.status} />
              </Link>
            ))}
        </div>
      ) : (
        !broadcasts.error && (
          <Notice>
            No broadcasts yet. Prepare a draft to review eligible recipients before sending.
          </Notice>
        )
      )}
    </div>
  );
}
