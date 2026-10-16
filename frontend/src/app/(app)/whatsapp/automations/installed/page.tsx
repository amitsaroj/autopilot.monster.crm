'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  whatsappAutomationService,
  type AutomationInstallation,
} from '@/services/whatsapp-automation.service';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  buttonClass,
  secondaryClass,
  errorMessage,
  formatDate,
} from '@/components/whatsapp/ui';

export default function Page() {
  const installations = useResource(whatsappAutomationService.installed, 15000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  async function change(row: AutomationInstallation, uninstall = false) {
    setBusy(true);
    setError(null);
    try {
      if (uninstall) await whatsappAutomationService.uninstall(row.id);
      else await whatsappAutomationService.disable(row.id);
      setConfirmId(null);
      await installations.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeading
        title="My WhatsApp automations"
        description="Manage activation and review results from recorded workflow executions."
        action={
          <Link className={buttonClass} href="/whatsapp/automations">
            Browse catalog
          </Link>
        }
      />
      {error && <Notice error>{error}</Notice>}
      {installations.error && (
        <Notice error>
          {installations.error}{' '}
          <button className="underline" onClick={() => void installations.reload()}>
            Retry
          </button>
        </Notice>
      )}
      {installations.loading && <Loading />}
      {!installations.loading && !installations.error && !installations.data?.length && (
        <Notice>
          No automations installed yet. Choose an automation from the catalog to configure your
          first draft.
        </Notice>
      )}
      <div className="space-y-4">
        {installations.data?.map((row) => (
          <article key={row.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{row.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Version {row.version} · Last execution {formatDate(row.analytics.lastExecutedAt)}
                </p>
              </div>
              <StatusBadge value={row.state} />
            </div>
            <dl className="my-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {(
                [
                  ['Executions', row.analytics.total],
                  ['Completed', row.analytics.completed],
                  ['Failed', row.analytics.failed],
                  ['Queued / running', row.analytics.running],
                  ['Paused runs', row.analytics.paused],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            {row.state !== 'UNINSTALLED' && row.readiness.issues.length > 0 && (
              <p className="mb-4 text-sm text-muted-foreground">
                {row.readiness.issues.map((issue) => issue.message).join(' · ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link className={secondaryClass} href={`/whatsapp/automations/${row.slug}`}>
                {row.state === 'UNINSTALLED' ? 'Reinstall' : 'Configure / activate'}
              </Link>
              <Link className={secondaryClass} href={`/whatsapp/automations/installed/${row.id}`}>
                Execution history
              </Link>
              <button
                className={secondaryClass}
                disabled={busy || row.state !== 'ACTIVE'}
                onClick={() => void change(row)}
              >
                Pause
              </button>
              {row.state !== 'UNINSTALLED' && (
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() => setConfirmId(row.id)}
                >
                  Uninstall
                </button>
              )}
            </div>
            {confirmId === row.id && (
              <div className="mt-4 space-y-3 rounded-lg border border-border p-4">
                <p className="text-sm">
                  Uninstall {row.name}? It will stop executing. Execution history and purchased
                  entitlement are retained.
                </p>
                <div className="flex gap-2">
                  <button
                    className={buttonClass}
                    disabled={busy}
                    onClick={() => void change(row, true)}
                  >
                    Confirm uninstall
                  </button>
                  <button
                    className={secondaryClass}
                    disabled={busy}
                    onClick={() => setConfirmId(null)}
                  >
                    Keep automation
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
