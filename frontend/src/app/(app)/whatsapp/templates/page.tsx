'use client';
import Link from 'next/link';
import { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import {
  whatsappTemplateService,
  type WhatsappTemplate,
} from '@/services/whatsapp-template.service';
import { whatsappAccountService } from '@/services/whatsapp-account.service';
import { parseApiData } from '@/lib/api/parse-response';
import { useResource } from '@/components/whatsapp/use-resource';
import { templateBody, templateSendIssue } from '@/components/whatsapp/template-utils';
import { DialogShell } from '@/components/ui/dialog-shell';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  Field,
  inputClass,
  buttonClass,
  secondaryClass,
  panelClass,
  errorMessage,
} from '@/components/whatsapp/ui';
export default function TemplatesPage() {
  const templates = useResource(
    async () => parseApiData<WhatsappTemplate[]>(await whatsappTemplateService.list()) ?? [],
  );
  const accounts = useResource(whatsappAccountService.list);
  const [phoneId, setPhoneId] = useState('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<{ id: string; kind: 'submit' | 'delete' } | null>(null);
  const connected = accounts.data?.filter((a) => a.status === 'CONNECTED') ?? [];
  const selectedAccount =
    connected.find((a) => a.phoneNumberId === phoneId) ??
    (!phoneId && connected.length === 1 ? connected[0] : undefined);
  const selected = selectedAccount?.phoneNumberId ?? '';
  const canUseAccount = (template?: WhatsappTemplate) =>
    !!template &&
    !!selectedAccount &&
    !accounts.error &&
    !accounts.loading &&
    (!template.businessAccountId ||
      template.businessAccountId === selectedAccount.businessAccountId);
  const action = async (id: string, kind: 'submit' | 'delete' | 'refresh') => {
    if (kind !== 'delete' && !canUseAccount(templates.data?.find((t) => t.id === id))) {
      setError('Choose a connected number belonging to this template’s Meta business account.');
      setConfirm(null);
      return;
    }
    setBusy(id);
    setError(null);
    setNotice('');
    setConfirm(null);
    try {
      if (kind === 'delete') {
        await whatsappTemplateService.remove(id);
        setNotice('Local template removed.');
      } else {
        const r =
          kind === 'submit'
            ? await whatsappTemplateService.sync(id, selected)
            : await whatsappTemplateService.refresh(id, selected);
        const t = parseApiData<WhatsappTemplate>(r);
        setNotice(
          kind === 'submit'
            ? `Submitted to Meta. Current status: ${t?.status ?? 'pending'}.`
            : `Provider status refreshed: ${t?.status ?? 'unknown'}.`,
        );
      }
      await templates.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  const refreshAll = async () => {
    if (!selected || accounts.error || accounts.loading) return;
    setBusy('all');
    setError(null);
    try {
      await whatsappTemplateService.refreshAll(selected);
      await templates.reload();
      setNotice('Submitted template statuses refreshed from Meta.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  const importFromMeta = async () => {
    if (!selected || !selectedAccount || accounts.error || accounts.loading) return;
    setBusy('import');
    setError(null);
    setNotice('');
    try {
      const response = await whatsappTemplateService.importFromMeta(selected);
      const result = parseApiData<{
        imported: number;
        unchanged: number;
        skippedUnsupported: number;
        conflicts: number;
      }>(response);
      if (!result) throw new Error('Meta template import returned no result.');
      await templates.reload();
      setNotice(
        `Imported ${result.imported}; ${result.unchanged} unchanged; ${result.skippedUnsupported} unsupported formats skipped; ${result.conflicts} conflicts. No templates were submitted to Meta.`,
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  return (
    <div className="space-y-6">
      <PageHeading
        title="Message templates"
        description="Create drafts, submit for Meta approval, and refresh provider status before customer outreach."
        action={
          <Link className={buttonClass} href="/whatsapp/templates/new">
            <Plus className="h-4 w-4" />
            Create template
          </Link>
        }
      />
      {(error || templates.error || accounts.error) && (
        <Notice error>{error || templates.error || accounts.error}</Notice>
      )}
      {notice && <Notice>{notice}</Notice>}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <Field label="Search templates">
            <input
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>
        </div>
        <div className="min-w-[200px]">
          <Field label="Meta account">
            <select
              className={inputClass}
              value={selected}
              disabled={!!busy || accounts.loading || !!accounts.error}
              onChange={(e) => {
                setPhoneId(e.target.value);
                setConfirm(null);
              }}
            >
              <option value="">Select connected number</option>
              {connected.map((a) => (
                <option key={a.id} value={a.phoneNumberId}>
                  {a.displayPhoneNumber || a.phoneNumberId}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          className={secondaryClass}
          disabled={!!busy || !selected || accounts.loading || !!accounts.error}
          onClick={() => void refreshAll()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Meta status
        </button>
        <button
          className={secondaryClass}
          disabled={!!busy || !selected || !selectedAccount || accounts.loading || !!accounts.error}
          onClick={() => void importFromMeta()}
        >
          {busy === 'import' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
          {busy === 'import' ? 'Importing templates…' : 'Import templates from Meta'}
        </button>
      </div>
      {!selected && (
        <Notice>
          Choose a connected Meta phone number to import, submit, or refresh templates. Local drafts can still be
          created.
        </Notice>
      )}
      {templates.loading ? (
        <Loading />
      ) : templates.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.data
            .filter((t) =>
              `${t.name} ${t.category} ${t.language}`.toLowerCase().includes(query.toLowerCase()),
            )
            .map((t) => (
              <article key={t.id} className={`${panelClass} space-y-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{t.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.category} · {t.language} ·{' '}
                      {t.waTemplateId ? 'Submitted to Meta' : 'Local draft'}
                    </p>
                  </div>
                  <StatusBadge value={t.status} />
                </div>
                <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">
                  {templateBody(t)}
                </p>
                {t.rejectionReason && <Notice error>{t.rejectionReason}</Notice>}
                {templateSendIssue(t) && <Notice>{templateSendIssue(t)}</Notice>}
                {selectedAccount &&
                  t.businessAccountId &&
                  t.businessAccountId !== selectedAccount.businessAccountId && (
                    <Notice>
                      Select a connected number from this template’s business account (
                      {t.businessAccountId}) to submit or refresh it.
                    </Notice>
                  )}
                <div className="flex flex-wrap gap-2">
                  <Link className={secondaryClass} href={`/whatsapp/templates/${t.id}`}>
                    Edit draft
                  </Link>
                  {t.waTemplateId ? (
                    <button
                      className={secondaryClass}
                      disabled={!!busy || !canUseAccount(t)}
                      onClick={() => void action(t.id, 'refresh')}
                    >
                      Refresh status
                    </button>
                  ) : null}
                  {(!t.waTemplateId || t.status !== 'APPROVED') && (
                    <button
                      className={secondaryClass}
                      disabled={!!busy || !canUseAccount(t)}
                      onClick={() => setConfirm({ id: t.id, kind: 'submit' })}
                    >
                      {t.waTemplateId ? 'Submit edits / resubmit' : 'Submit to Meta'}
                    </button>
                  )}
                  <button
                    className={secondaryClass}
                    disabled={!!busy}
                    onClick={() => setConfirm({ id: t.id, kind: 'delete' })}
                  >
                    Delete local draft
                  </button>
                </div>
              </article>
            ))}
        </div>
      ) : (
        !templates.error && (
          <Notice>No templates yet. Create a draft to prepare your first approved message.</Notice>
        )
      )}
      <DialogShell
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.kind === 'submit' ? 'Submit template' : 'Delete local template'}
      >
        <div className="space-y-4 p-6">
          <h2 className="font-semibold">
            {confirm?.kind === 'submit'
              ? 'Submit this template to Meta?'
              : 'Delete this local template?'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {confirm?.kind === 'submit'
              ? 'Meta will review the content. This does not send messages to customers.'
              : 'Deleting the local record does not delete the template from Meta.'}
          </p>
          {confirm?.kind === 'submit' && (
            <p className="text-sm">
              Account: {selectedAccount?.displayPhoneNumber || selected} ·{' '}
              {selectedAccount?.businessAccountId}
            </p>
          )}
          <div className="flex gap-2">
            <button className={secondaryClass} onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              className={buttonClass}
              disabled={
                !!busy ||
                (confirm?.kind === 'submit' &&
                  !canUseAccount(templates.data?.find((t) => t.id === confirm.id)))
              }
              onClick={() => confirm && void action(confirm.id, confirm.kind)}
            >
              {confirm?.kind === 'submit' ? 'Submit to Meta' : 'Delete'}
            </button>
          </div>
        </div>
      </DialogShell>
    </div>
  );
}
