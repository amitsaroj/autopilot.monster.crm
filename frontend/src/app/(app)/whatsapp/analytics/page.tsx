'use client';
import { whatsappAnalyticsService } from '@/services/whatsapp-analytics.service';
import { useResource } from '@/components/whatsapp/use-resource';
import { PageHeading, Notice, Loading, secondaryClass, panelClass } from '@/components/whatsapp/ui';
export default function AnalyticsPage() {
  const resource = useResource(whatsappAnalyticsService.read, 30000);
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
            ].map(([label, value]) => (
              <article className={panelClass} key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {typeof value === 'number' ? value.toLocaleString() : '—'}
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
