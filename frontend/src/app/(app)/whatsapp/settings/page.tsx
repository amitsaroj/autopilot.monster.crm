'use client';
import { useEffect, useRef, useState } from 'react';
import { RefreshCw, ShieldCheck, Unplug, Loader2, Facebook } from 'lucide-react';
import {
  whatsappAccountService,
  type AccountHealth,
  type ConnectResult,
  type EmbeddedSignupInput,
} from '@/services/whatsapp-account.service';
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
import { whatsappWebhookService } from '@/services/whatsapp-webhook.service';

// Embedded Signup is only offered when both public IDs are configured at build time.
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? '';
const META_ES_CONFIG_ID = process.env.NEXT_PUBLIC_META_ES_CONFIG_ID ?? '';
const EMBEDDED_SIGNUP_ENABLED = Boolean(META_APP_ID && META_ES_CONFIG_ID);
const FACEBOOK_ORIGIN = 'https://www.facebook.com';

interface FacebookLoginResponse {
  authResponse?: { code?: string } | null;
}
interface FacebookSdk {
  init(options: {
    appId: string;
    autoLogAppEvents: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  login(
    callback: (response: FacebookLoginResponse) => void,
    options: {
      config_id: string;
      response_type: 'code';
      override_default_response_type: boolean;
      extras: { setup: Record<string, never>; sessionInfoVersion: string };
    },
  ): void;
}
declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

let sdkPromise: Promise<FacebookSdk> | null = null;
function loadFacebookSdk(): Promise<FacebookSdk> {
  sdkPromise ??= new Promise<FacebookSdk>((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (!window.FB) return reject(new Error('The Facebook SDK failed to initialise.'));
      window.FB.init({
        appId: META_APP_ID,
        autoLogAppEvents: true,
        xfbml: false,
        version: 'v23.0',
      });
      resolve(window.FB);
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error('Could not load the Facebook SDK. Check ad blockers or network access.'));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

type SignupSession = Pick<EmbeddedSignupInput, 'businessAccountId' | 'phoneNumberId'>;
/** Parses Meta's WA_EMBEDDED_SIGNUP postMessage. Returns 'cancel', session IDs, or null. */
function readSessionInfo(raw: unknown): SignupSession | 'cancel' | 'no-phone' | null {
  if (typeof raw !== 'string') return null;
  let message: unknown;
  try {
    message = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!message || typeof message !== 'object') return null;
  const { type, event, data } = message as { type?: unknown; event?: unknown; data?: unknown };
  if (type !== 'WA_EMBEDDED_SIGNUP' || typeof event !== 'string') return null;
  if (event === 'CANCEL' || event === 'ERROR') return 'cancel';
  if (!event.startsWith('FINISH') || !data || typeof data !== 'object') return null;
  const { waba_id: waba, phone_number_id: phone } = data as {
    waba_id?: unknown;
    phone_number_id?: unknown;
  };
  if (typeof waba !== 'string' || !/^[1-9][0-9]{0,63}$/.test(waba)) return null;
  if (typeof phone !== 'string' || !/^[1-9][0-9]{0,63}$/.test(phone)) return 'no-phone';
  return { businessAccountId: waba, phoneNumberId: phone };
}

function connectedNotice(result: ConnectResult | null, via: string) {
  return result?.setupWarnings?.length
    ? `Connected ${via}, but setup needs attention: ${result.setupWarnings.join(' ')}`
    : `Account connected ${via}. Credentials are stored encrypted by the server.`;
}

export default function AccountsPage() {
  const accounts = useResource(whatsappAccountService.list);
  const webhookEvents = useResource(whatsappWebhookService.list, 15000);
  const [form, setForm] = useState({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<Record<string, AccountHealth>>({});
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [fb, setFb] = useState<FacebookSdk | null>(null);
  const [pin, setPin] = useState('');
  const [replayingWebhook, setReplayingWebhook] = useState<string | null>(null);
  const [webhookNotice, setWebhookNotice] = useState('');
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const codeRef = useRef<string | null>(null);
  const sessionRef = useRef<SignupSession | null>(null);

  const completeSignup = async () => {
    const code = codeRef.current;
    const session = sessionRef.current;
    if (!code || !session) return; // Wait for both the login callback and the session message.
    codeRef.current = null;
    sessionRef.current = null;
    setBusy('signup');
    try {
      const result = await whatsappAccountService.embeddedSignup({
        code,
        ...session,
        ...(pin ? { pin } : {}),
      });
      setPin('');
      setNotice(connectedNotice(result, 'with Facebook'));
      await accounts.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy('');
    }
  };
  const completeRef = useRef(completeSignup);
  completeRef.current = completeSignup;

  useEffect(() => {
    if (!EMBEDDED_SIGNUP_ENABLED) return;
    let active = true;
    // Loaded up front so FB.login runs inside the click gesture (popup blockers).
    loadFacebookSdk()
      .then((sdk) => active && setFb(sdk))
      .catch((e: unknown) => active && setError(errorMessage(e)));
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== FACEBOOK_ORIGIN) return;
      const info = readSessionInfo(event.data);
      if (info === 'cancel') {
        sessionRef.current = null;
      } else if (info === 'no-phone') {
        setError(
          'Meta did not return a phone number. Add a number to the WhatsApp account and retry.',
        );
      } else if (info) {
        sessionRef.current = info;
        void completeRef.current();
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      active = false;
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const startSignup = () => {
    if (!fb) return;
    setError(null);
    setNotice('');
    codeRef.current = null;
    sessionRef.current = null;
    setBusy('signup');
    // The SDK rejects async callbacks; keep this synchronous.
    fb.login(
      (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setBusy('');
          setError('Facebook sign-up was cancelled or did not complete.');
          return;
        }
        codeRef.current = code;
        void completeRef.current();
        window.setTimeout(() => {
          if (codeRef.current !== code) return;
          codeRef.current = null;
          setBusy('');
          setError('Meta did not report which WhatsApp number was selected. Please retry.');
        }, 10000);
      },
      {
        config_id: META_ES_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, sessionInfoVersion: '3' },
      },
    );
  };

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('connect');
    setError(null);
    setNotice('');
    try {
      const result = await whatsappAccountService.connect({ ...form, provider: 'meta' });
      setForm({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
      setNotice(connectedNotice(result, 'with an access token'));
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
      await accounts.reload(); // Picks up the persisted diagnostics.
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

  const replayWebhook = async (id: string) => {
    setReplayingWebhook(id);
    setWebhookError(null);
    setWebhookNotice('');
    try {
      await whatsappWebhookService.replay(id);
      setWebhookNotice('Failed webhook queued for replay. Its status will refresh automatically.');
      await webhookEvents.reload();
    } catch (e) {
      setWebhookError(errorMessage(e));
    } finally {
      setReplayingWebhook(null);
    }
  };

  const manualForm = (
    <form className="space-y-4" onSubmit={(e) => void connect(e)}>
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
    </form>
  );

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
                  <div>
                    <dt className="text-muted-foreground">Quality rating</dt>
                    <dd>{a.qualityRating ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Messaging limit</dt>
                    <dd>{a.messagingLimitTier ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Display name status</dt>
                    <dd>{a.nameStatus ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Webhooks</dt>
                    <dd>
                      {a.webhookSubscribed === null
                        ? 'Unknown'
                        : a.webhookSubscribed
                          ? 'Subscribed'
                          : 'Not subscribed'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last health check</dt>
                    <dd>{formatDate(a.lastHealthCheckAt)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(a.capabilities).map(([key, supported]) => (
                    <span key={key} className="rounded bg-muted px-2 py-1 text-xs">
                      {key}: {supported ? 'supported' : 'unavailable'}
                    </span>
                  ))}
                </div>
                {a.lastHealthError && (
                  <div className="mt-4">
                    <Notice error>{a.lastHealthError}</Notice>
                  </div>
                )}
                {health[a.id] && !health[a.id].error && (
                  <div className="mt-4">
                    <Notice>
                      {health[a.id].healthy
                        ? 'Meta reports a verified number, acceptable quality and an active webhook subscription.'
                        : 'Account needs attention.'}{' '}
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
                    {busy === a.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Refresh health
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
        <section className={`${panelClass} space-y-4 self-start`}>
          <h2 className="font-semibold">Connect or reconnect a number</h2>
          {EMBEDDED_SIGNUP_ENABLED && (
            <div className="space-y-4">
              <Field
                label="Two-step verification PIN (optional)"
                hint="Six digits. Only needed to register a new number for Cloud API messaging."
              >
                <input
                  className={inputClass}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="off"
                />
              </Field>
              <button
                type="button"
                className={buttonClass}
                disabled={!!busy || !fb || (pin.length > 0 && pin.length !== 6)}
                onClick={startSignup}
              >
                {busy === 'signup' || !fb ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Facebook className="h-4 w-4" />
                )}
                Connect with Facebook
              </button>
              <p className="text-xs text-muted-foreground">
                Opens Meta&apos;s sign-up window to choose or create a WhatsApp Business Account and
                number. Webhooks are subscribed automatically.
              </p>
            </div>
          )}
          {EMBEDDED_SIGNUP_ENABLED ? (
            <details className="border-t border-border pt-4">
              <summary className="cursor-pointer text-sm font-medium">
                Advanced: connect with an access token
              </summary>
              <div className="mt-4">{manualForm}</div>
            </details>
          ) : (
            manualForm
          )}
          <p className="text-xs text-muted-foreground">
            Requires a Meta Business account, an authorized phone number, provider permissions, and
            server credential encryption. Connecting does not send messages.
          </p>
        </section>
      </div>
      <section className={`${panelClass} space-y-4`} aria-labelledby="webhook-events-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="webhook-events-heading" className="text-lg font-semibold">
              Webhook delivery history
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recent events for this workspace. Payload contents and other tenants’ events are not
              shown.
            </p>
          </div>
          <button className={secondaryClass} onClick={() => void webhookEvents.reload()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
        {webhookError && <Notice error>{webhookError}</Notice>}
        {webhookNotice && <Notice>{webhookNotice}</Notice>}
        {webhookEvents.loading ? (
          <Loading />
        ) : webhookEvents.error ? (
          <Notice error>{webhookEvents.error}</Notice>
        ) : webhookEvents.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Received</th>
                  <th className="py-2 pr-3 font-medium">Phone number ID</th>
                  <th className="py-2 pr-3 font-medium">Event</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Attempts / action</th>
                </tr>
              </thead>
              <tbody>
                {webhookEvents.data.map((event) => (
                  <tr key={event.id} className="border-b border-border/70 align-top">
                    <td className="py-3 pr-3">{formatDate(event.receivedAt)}</td>
                    <td className="break-all py-3 pr-3 font-mono text-xs">
                      {event.phoneNumberId ?? 'Unmapped account'}
                    </td>
                    <td className="py-3 pr-3">{event.field}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge value={event.status} />
                      {event.lastError && (
                        <p className="mt-2 max-w-sm text-xs text-destructive">{event.lastError}</p>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{event.attempts}</span>
                        {event.status === 'FAILED' && (
                          <button
                            className={secondaryClass}
                            disabled={!!replayingWebhook}
                            onClick={() => void replayWebhook(event.id)}
                          >
                            {replayingWebhook === event.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Replay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Notice>No WhatsApp webhook events have been received for this workspace.</Notice>
        )}
      </section>
      <DialogShell
        open={!!disconnectId}
        onOpenChange={(o) => !o && setDisconnectId(null)}
        title="Disconnect WhatsApp account"
      >
        <div className="space-y-4 p-6">
          <h2 className="font-semibold">Disconnect this number?</h2>
          <p className="text-sm text-muted-foreground">
            Stored credentials will be erased. Sending from this number will stop until you
            reconnect it. If no other connected number uses its business account, this app&apos;s
            webhook subscription is removed at Meta as well.
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
