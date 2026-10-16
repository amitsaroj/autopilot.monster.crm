'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { whatsappAutomationService } from '@/services/whatsapp-automation.service';
import { workflowService } from '@/services/workflow.service';
import { useResource } from '@/components/whatsapp/use-resource';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  Field,
  inputClass,
  secondaryClass,
  errorMessage,
  formatDate,
} from '@/components/whatsapp/ui';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const runs = useResource(() => whatsappAutomationService.executions(id), 15000);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const filtered = runs.data?.filter((run) => !status || run.status === status) ?? [];
  async function control(runId: string, action: 'pause' | 'resume' | 'cancel') {
    setBusy(true);
    setError(null);
    try {
      await workflowService.controlExecution(runId, action);
      await runs.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function retry(runId: string) {
    setBusy(true);
    setError(null);
    try {
      await workflowService.retryExecution(runId);
      await runs.reload();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeading
        title="Automation execution history"
        description="Latest 100 executions for this automation. Inspect each run for action results and provider failures."
        action={
          <Link className={secondaryClass} href="/whatsapp/automations/installed">
            My automations
          </Link>
        }
      />
      <div className="max-w-xs">
        <Field label="Execution status">
          <select
            className={inputClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      {error && <Notice error>{error}</Notice>}
      {runs.error && (
        <Notice error>
          {runs.error}{' '}
          <button className="underline" onClick={() => void runs.reload()}>
            Retry loading
          </button>
        </Notice>
      )}
      {runs.loading && <Loading />}
      {!runs.loading && !runs.error && !filtered.length && (
        <Notice>
          No executions match this filter. Runs appear after an active automation receives its
          configured trigger.
        </Notice>
      )}
      <div className="space-y-3">
        {filtered.map((run) => (
          <article key={run.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge value={run.status} />
              <span className="text-xs text-muted-foreground">{formatDate(run.startedAt)}</span>
            </div>
            {run.error && <p className="text-sm text-destructive">{run.error}</p>}
            {run.pauseReason && (
              <p className="text-sm text-muted-foreground">
                {run.pauseReason.replaceAll('_', ' ')}
              </p>
            )}
            <div className="flex gap-2">
              <Link className={secondaryClass} href={`/workflows/${run.flowId}/runs/${run.id}`}>
                Inspect execution
              </Link>
              {run.status === 'FAILED' && (
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() => void retry(run.id)}
                >
                  Retry failed run
                </button>
              )}
              {['QUEUED', 'PAUSED'].includes(run.status) && (
                <>
                  <button
                    className={secondaryClass}
                    disabled={busy}
                    onClick={() =>
                      void control(run.id, run.pauseReason === 'manual' ? 'resume' : 'pause')
                    }
                  >
                    {run.pauseReason === 'manual' ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    className={secondaryClass}
                    disabled={busy}
                    onClick={() => void control(run.id, 'cancel')}
                  >
                    Cancel run
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
