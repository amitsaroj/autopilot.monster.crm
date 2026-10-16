'use client';
import { useState } from 'react';
import Link from 'next/link';
import { whatsappAnalyticsService } from '@/services/whatsapp-analytics.service';
import { useResource } from '@/components/whatsapp/use-resource';
import { PageHeading, Notice, Loading, secondaryClass, panelClass } from '@/components/whatsapp/ui';
export default function AnalyticsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const from = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).toISOString() : undefined;
  const to = toDate
    ? new Date(Date.parse(`${toDate}T00:00:00.000Z`) + 86400000).toISOString()
    : undefined;
  const resource = useResource(() => whatsappAnalyticsService.read(from, to), 30000);
  const data = resource.data;
  return (
    <div className="space-y-6">
      <PageHeading
        title="WhatsApp analytics"
        description="Measured message states and response timing from your workspace history."
        action={
          <button className={secondaryClass} onClick={() => void resource.reload()}>
            Refresh
          </button>
        }
      />
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">From (UTC)</span>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Through (UTC)</span>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <button
          className={secondaryClass}
          disabled={!!fromDate && !!toDate && fromDate > toDate}
          onClick={() => void resource.reload()}
        >
          Apply range
        </button>
      </div>
      {resource.error && <Notice error>{resource.error}</Notice>}
      {resource.loading ? (
        <Loading />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Messages', data.total],
              ['Inbound', data.inbound],
              ['Outbound', data.outbound],
              ['Accepted by provider', data.submitted],
              ['Delivered (including read)', data.delivered],
              ['Read', data.read],
              ['Failed', data.failed],
              ['Unknown status', data.unknown],
              ['CSAT responses', data.csat.responses],
              [
                'Average CSAT',
                data.csat.average === null ? '—' : `${data.csat.average.toFixed(2)} / 5`,
              ],
            ].map(([label, value]) => (
              <article className={panelClass} key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              </article>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className={panelClass}>
              <h2 className="font-semibold">Response timing</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt>Average recorded response time</dt>
                  <dd>
                    {data.averageResponseTimeMs > 0
                      ? `${(data.averageResponseTimeMs / 60000).toFixed(1)} min`
                      : 'No recorded response time'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Recorded SLA breaches</dt>
                  <dd>{data.breached}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                These metrics describe recorded replies, not a live queue of unanswered messages.
              </p>
            </article>
            <article className={panelClass}>
              <h2 className="font-semibold">Provider status breakdown</h2>
              <dl className="mt-4 space-y-2 text-sm">
                {Object.entries(data.counts).map(([status, count]) => (
                  <div key={status} className="flex justify-between gap-2">
                    <dt>{status.replaceAll('_', ' ')}</dt>
                    <dd className="tabular-nums">{count.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
          <section className={panelClass} aria-labelledby="campaign-analytics-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="campaign-analytics-heading" className="font-semibold">
                  Broadcast campaigns
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.campaigns.summary.count.toLocaleString()} campaigns ·{' '}
                  {data.campaigns.summary.recipients.toLocaleString()} recorded recipients ·{' '}
                  {data.campaigns.summary.delivered.toLocaleString()} delivered
                </p>
              </div>
              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {Object.entries(data.campaigns.summary.statuses).map(([status, count]) => (
                  <div key={status} className="flex gap-1">
                    <dt>{status.replaceAll('_', ' ')}:</dt>
                    <dd className="tabular-nums">{count.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {data.campaigns.items.length ? (
              <div className="mt-4 divide-y divide-border">
                {data.campaigns.items.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/whatsapp/broadcast/${campaign.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm hover:text-primary"
                  >
                    <span className="min-w-48">
                      <span className="block font-medium">{campaign.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleString()} · {campaign.status}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {campaign.total.toLocaleString()} recipients ·{' '}
                      {campaign.sent.toLocaleString()} sent · {campaign.delivered.toLocaleString()}{' '}
                      delivered · {campaign.read.toLocaleString()} read ·{' '}
                      {campaign.failed.toLocaleString()} failed
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No campaigns in this date range.</p>
            )}
          </section>
          <section className={panelClass} aria-labelledby="automation-analytics-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="automation-analytics-heading" className="font-semibold">
                  WhatsApp automation runs
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.automationRuns.summary.count.toLocaleString()} recorded runs
                </p>
              </div>
              <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {Object.entries(data.automationRuns.summary.statuses).map(([status, count]) => (
                  <div key={status} className="flex gap-1">
                    <dt>{status.replaceAll('_', ' ')}:</dt>
                    <dd className="tabular-nums">{count.toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {data.automationRuns.items.length ? (
              <div className="mt-4 divide-y divide-border">
                {data.automationRuns.items.map((run) => (
                  <details key={run.id} className="py-3 text-sm">
                    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                      <span className="font-medium">{run.workflowName}</span>
                      <span className="text-xs text-muted-foreground">
                        {run.status} · {new Date(run.startedAt).toLocaleString()}
                      </span>
                    </summary>
                    <dl className="mt-3 grid gap-2 rounded-lg bg-muted/40 p-3 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Run ID</dt>
                        <dd className="break-all">{run.id}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Workflow ID</dt>
                        <dd className="break-all">{run.flowId}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Trigger event</dt>
                        <dd>{run.eventName ?? 'Not recorded'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Completed</dt>
                        <dd>
                          {run.completedAt
                            ? new Date(run.completedAt).toLocaleString()
                            : 'Not completed'}
                        </dd>
                      </div>
                    </dl>
                  </details>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No WhatsApp workflow runs in this date range.
              </p>
            )}
          </section>
          <Notice>
            Provider cost and revenue attribution are not available. Accepted messages are not proof
            of delivery; delivery and read states depend on provider callbacks.
          </Notice>
        </>
      ) : (
        !resource.error && <Notice>No analytics response is available yet.</Notice>
      )}
    </div>
  );
}
