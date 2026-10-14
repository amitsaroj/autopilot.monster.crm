'use client';
import { useState } from 'react';
import { RefreshCw, ShieldCheck, Unplug, Loader2 } from 'lucide-react';
import { whatsappAccountService, type AccountHealth } from '@/services/whatsapp-account.service';
import { useResource } from '@/components/whatsapp/use-resource';
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
  formatDate,
} from '@/components/whatsapp/ui';
import { DialogShell } from '@/components/ui/dialog-shell';
export default function AccountsPage() {
  const accounts = useResource(whatsappAccountService.list);
  const [form, setForm] = useState({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<Record<string, AccountHealth>>({});
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('connect');
    setError(null);
    setNotice('');
    try {
      await whatsappAccountService.connect({ ...form, provider: 'meta' });
      setForm({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
      setNotice('Account connected. Credentials are stored encrypted by the server.');
      await accounts.reload();
    } catch (e) {
      setError(errorMessage(e));
      setForm((f) => ({ ...f, accessToken: '' }));
    } finally {
      setBusy('');
    }
  };
  const check = async (id: string) => {
    setBusy(id);
    setError(null);
    try {
      const h = await whatsappAccountService.health(id);
      if (h) setHealth((current) => ({ ...current, [id]: h }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  const disconnect = async () => {
    if (!disconnectId) return;
    setBusy(disconnectId);
    setError(null);
    try {
      await whatsappAccountService.disconnect(disconnectId);
      setDisconnectId(null);
      setNotice('Account disconnected and stored token erased.');
      await accounts.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  return (
    <div className="space-y-6">
      <PageHeading
        title="Connected accounts"
        description="Connect a Meta WhatsApp Business number and check its access without sending a message."
        action={
          <button className={secondaryClass} onClick={() => void accounts.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />
      {(error || accounts.error) && <Notice error>{error || accounts.error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-4">
          {accounts.loading ? (
            <Loading />
          ) : accounts.data?.length ? (
            accounts.data.map((a) => (
              <article key={a.id} className={panelClass}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">
                      {a.verifiedName || a.displayPhoneNumber || 'WhatsApp Business'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.displayPhoneNumber || a.phoneNumberId}
                    </p>
                  </div>
                  <StatusBadge value={a.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Phone number ID</dt>
                    <dd className="break-all font-mono">{a.phoneNumberId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Business account ID</dt>
                    <dd className="break-all font-mono">{a.businessAccountId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last validated</dt>
                    <dd>{formatDate(a.validatedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Provider version</dt>
                    <dd>{a.apiVersion}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(a.capabilities).map(([key, supported]) => (
                    <span key={key} className="rounded bg-muted px-2 py-1 text-xs">
                      {key}: {supported ? 'supported' : 'unavailable'}
                    </span>
                  ))}
                </div>
                {health[a.id] && (
                  <div className="mt-4">
                    <Notice>
                      {health[a.id].healthy
                        ? 'Meta reports a verified number and acceptable quality.'
                        : 'Account needs attention.'}{' '}
                      {health[a.id].qualityRating && `Quality: ${health[a.id].qualityRating}.`}{' '}
                      {health[a.id].codeVerificationStatus &&
                        `Verification: ${health[a.id].codeVerificationStatus}.`}{' '}
                      Checked {formatDate(health[a.id].checkedAt)}. Read access does not guarantee
                      message delivery.
                    </Notice>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    className={secondaryClass}
                    disabled={!!busy || a.status !== 'CONNECTED'}
                    onClick={() => void check(a.id)}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Check access
                  </button>
                  <button
                    className={secondaryClass}
                    disabled={!!busy || a.status !== 'CONNECTED'}
                    onClick={() => setDisconnectId(a.id)}
                  >
                    <Unplug className="h-4 w-4" />
                    Disconnect
                  </button>
                </div>
              </article>
            ))
          ) : (
            !accounts.error && (
              <Notice>
                No connected numbers yet. Add your Meta credentials to start configuring WhatsApp.
              </Notice>
            )
          )}
        </section>
        <form className={`${panelClass} space-y-4 self-start`} onSubmit={(e) => void connect(e)}>
          <h2 className="font-semibold">Connect or reconnect a number</h2>
          <Field label="Meta phone number ID">
            <input
              className={inputClass}
              value={form.phoneNumberId}
              onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })}
              required
              pattern="[1-9][0-9]{0,63}"
              autoComplete="off"
            />
          </Field>
          <Field label="WhatsApp Business Account ID">
            <input
              className={inputClass}
              value={form.businessAccountId}
              onChange={(e) => setForm({ ...form, businessAccountId: e.target.value })}
              required
              pattern="[1-9][0-9]{0,63}"
              autoComplete="off"
            />
          </Field>
          <Field
            label="Access token"
            hint="Write-only. Existing tokens are never downloaded or displayed. The server validates access and encrypts this credential."
          >
            <input
              type="password"
              className={inputClass}
              value={form.accessToken}
              onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
              required
              maxLength={8192}
              autoComplete="new-password"
              spellCheck={false}
            />
          </Field>
          <button className={buttonClass} disabled={!!busy}>
            {busy === 'connect' && <Loader2 className="h-4 w-4 animate-spin" />}Validate and connect
          </button>
          <p className="text-xs text-muted-foreground">
            Requires a Meta Business account, an authorized phone number, provider permissions, and
            server credential encryption. Connecting does not send messages.
          </p>
        </form>
      </div>
      <DialogShell
        open={!!disconnectId}
        onOpenChange={(o) => !o && setDisconnectId(null)}
        title="Disconnect WhatsApp account"
      >
        <div className="space-y-4 p-6">
          <h2 className="font-semibold">Disconnect this number?</h2>
          <p className="text-sm text-muted-foreground">
            Stored credentials will be erased. Sending from this number will stop until you
            reconnect it.
          </p>
          <div className="flex gap-2">
            <button
              className={secondaryClass}
              disabled={!!busy}
              onClick={() => setDisconnectId(null)}
            >
              Keep connected
            </button>
            <button className={buttonClass} disabled={!!busy} onClick={() => void disconnect()}>
              Disconnect
            </button>
          </div>
        </div>
      </DialogShell>
    </div>
  );
}
