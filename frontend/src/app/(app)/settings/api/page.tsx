'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Webhook, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  developerSettingsService,
  ApiKey,
  WebhookEndpoint,
  WebhookDelivery,
  OAuthApp,
} from '@/services/developer-settings.service';

export default function SettingsApiPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [oauthApps, setOauthApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState('whatsapp:read');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('1000');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState('message.received');
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<Record<string, WebhookDelivery[]>>({});
  const [newAppName, setNewAppName] = useState('');
  const [newAppRedirect, setNewAppRedirect] = useState('https://localhost/callback');
  const [createdOAuth, setCreatedOAuth] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [keysRes, hooksRes, appsRes] = await Promise.all([
        developerSettingsService.listApiKeys(),
        developerSettingsService.listWebhooks(),
        developerSettingsService.listOAuthApps(),
      ]);
      setKeys(keysRes.data?.data ?? []);
      setWebhooks(hooksRes.data?.data ?? []);
      setOauthApps(appsRes.data?.data ?? []);
    } catch {
      toast.error('Failed to load developer settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    const permissions = [
      ...new Set(
        newKeyPermissions
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ];
    if (!permissions.length) {
      toast.error('Select at least one API key permission');
      return;
    }
    const rateLimit = Number(newKeyRateLimit);
    if (!Number.isInteger(rateLimit) || rateLimit < 1 || rateLimit > 100000) {
      toast.error('Rate limit must be an integer from 1 to 100,000 requests per window');
      return;
    }
    try {
      const res = await developerSettingsService.createApiKey(
        newKeyName.trim(),
        permissions,
        rateLimit,
      );
      setCreatedKey(res.data.data.key);
      setNewKeyName('');
      toast.success('API key created');
      void load();
    } catch {
      toast.error('Failed to create API key');
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Revoke this API key?')) return;
    try {
      await developerSettingsService.revokeApiKey(id);
      toast.success('API key revoked');
      void load();
    } catch {
      toast.error('Failed to revoke key');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await developerSettingsService.deleteWebhook(id);
      toast.success('Webhook deleted');
      void load();
    } catch {
      toast.error('Failed to delete webhook');
    }
  };

  const handleCreateWebhook = async () => {
    const events = [
      ...new Set(
        newWebhookEvents
          .split(',')
          .map((event) => event.trim())
          .filter(Boolean),
      ),
    ];
    if (!newWebhookName.trim() || !newWebhookUrl.trim() || !events.length) return;
    try {
      const res = await developerSettingsService.createWebhook({
        name: newWebhookName.trim(),
        url: newWebhookUrl.trim(),
        events,
      });
      setWebhookSecret(res.data.data.secret);
      setNewWebhookName('');
      setNewWebhookUrl('');
      toast.success('Webhook created');
      void load();
    } catch {
      toast.error('Webhook creation failed. Use a public HTTPS endpoint and valid event names.');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const result = (await developerSettingsService.testWebhook(id)).data.data;
      if (result.success) toast.success(`Test delivered (HTTP ${result.status})`);
      else toast.error(`Test failed${result.status ? ` (HTTP ${result.status})` : ''}`);
      void load();
    } catch {
      toast.error('Webhook test failed');
    }
  };

  const handleToggleWebhook = async (webhook: WebhookEndpoint) => {
    try {
      await developerSettingsService.updateWebhook(webhook.id, {
        status: webhook.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      });
      toast.success(webhook.status === 'ACTIVE' ? 'Webhook paused' : 'Webhook activated');
      void load();
    } catch {
      toast.error('Could not update webhook status');
    }
  };

  const handleRotateWebhookSecret = async (id: string) => {
    if (!confirm('Rotate this signing secret? The existing receiver must be updated immediately.'))
      return;
    try {
      const result = await developerSettingsService.rotateWebhookSecret(id);
      setWebhookSecret(result.data.data.secret);
      toast.success('Signing secret rotated');
    } catch {
      toast.error('Could not rotate webhook secret');
    }
  };

  const handleLoadDeliveries = async (id: string) => {
    try {
      const result = await developerSettingsService.getWebhookDeliveries(id);
      setDeliveryLogs((current) => ({ ...current, [id]: result.data.data.data }));
    } catch {
      toast.error('Could not load webhook delivery history');
    }
  };

  const handleReplayDelivery = async (id: string, deliveryId: string) => {
    try {
      await developerSettingsService.replayWebhookDelivery(id, deliveryId, crypto.randomUUID());
      toast.success('Delivery replay queued');
      await handleLoadDeliveries(id);
    } catch {
      toast.error('Replay failed; successful deliveries cannot be replayed');
    }
  };

  const handleCreateOAuthApp = async () => {
    if (!newAppName.trim()) return;
    try {
      const res = await developerSettingsService.createOAuthApp({
        name: newAppName.trim(),
        redirectUris: [newAppRedirect],
      });
      setCreatedOAuth({
        clientId: res.data.data.clientId,
        clientSecret: res.data.data.clientSecret,
      });
      setNewAppName('');
      toast.success('OAuth app created');
      void load();
    } catch {
      toast.error('Failed to create OAuth app');
    }
  };

  const handleRevokeOAuthApp = async (id: string) => {
    if (!confirm('Revoke this OAuth app?')) return;
    try {
      await developerSettingsService.revokeOAuthApp(id);
      toast.success('OAuth app revoked');
      void load();
    } catch {
      toast.error('Failed to revoke OAuth app');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">API Keys & Webhooks</h1>
        <p className="page-description">Manage developer access tokens and webhook endpoints</p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          API keys are server-to-server credentials. Grant only the permissions required, and never
          share a key publicly or commit it to version control.
        </p>
      </div>

      {createdKey && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm font-medium text-green-700">New API key (copy now — shown once):</p>
          <code className="block mt-2 text-xs font-mono break-all">{createdKey}</code>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-[hsl(var(--brand))]" />
          <h2 className="text-sm font-semibold">API Keys</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_0.65fr_auto]">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name"
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <input
            aria-label="API key permissions"
            value={newKeyPermissions}
            onChange={(e) => setNewKeyPermissions(e.target.value)}
            placeholder="whatsapp:read, workflow:execute"
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <input
            aria-label="API key requests per rate window"
            type="number"
            min={1}
            max={100000}
            step={1}
            value={newKeyRateLimit}
            onChange={(event) => setNewKeyRateLimit(event.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <button
            onClick={() => void handleCreateKey()}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-[hsl(var(--brand))] text-white rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" /> Generate
          </button>
          <p className="text-xs text-muted-foreground sm:col-span-4">
            Comma-separated resource permissions, such as <code>whatsapp:read</code> or{' '}
            <code>workflow:execute</code>. Permissions cannot exceed your own access. Rate limit is
            requests per configured throttle window.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            aria-label="Webhook name"
            value={newWebhookName}
            onChange={(e) => setNewWebhookName(e.target.value)}
            placeholder="Endpoint name"
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <input
            aria-label="Webhook HTTPS URL"
            type="url"
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            placeholder="https://example.com/webhook"
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <input
            aria-label="Webhook event names"
            value={newWebhookEvents}
            onChange={(e) => setNewWebhookEvents(e.target.value)}
            placeholder="message.received, message.delivered"
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background sm:col-span-2"
          />
          <button
            onClick={() => void handleCreateWebhook()}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-[hsl(var(--brand))] text-white rounded-lg sm:col-span-2"
          >
            <Plus className="h-3.5 w-3.5" /> Add HTTPS webhook
          </button>
        </div>
        {webhookSecret && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3" role="status">
            <p className="text-sm font-medium">Signing secret — copy now; it is shown only once.</p>
            <code className="mt-1 block break-all text-xs">{webhookSecret}</code>
            <button onClick={() => setWebhookSecret(null)} className="mt-2 text-xs underline">
              Hide secret
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Requests include an HMAC-SHA256 X-Webhook-Signature, event name, delivery ID, and stable
          idempotency key. Retries reuse the same delivery ID.
        </p>
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{key.name}</p>
                <code className="text-xs font-mono text-muted-foreground">{key.keyPrefix}...</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Created {new Date(key.createdAt).toLocaleDateString()} · {key.status ?? 'ACTIVE'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scopes: {key.permissions.length ? key.permissions.join(', ') : 'none'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {key.rateLimit ?? 1000} requests per throttle window
                </p>
              </div>
              <button
                onClick={() => void handleRevokeKey(key.id)}
                className="p-2 rounded-lg border border-border hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-[hsl(var(--brand))]" />
          <h2 className="text-sm font-semibold">Webhooks</h2>
        </div>
        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No webhooks configured.</p>
          ) : (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{webhook.name}</p>
                    <p className="text-sm font-mono break-all text-muted-foreground">
                      {webhook.url}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {webhook.status} · {webhook.failureCount} consecutive failures
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-0.5 bg-muted text-xs rounded font-mono"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleToggleWebhook(webhook)}
                    className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
                  >
                    {webhook.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    aria-label={`Test ${webhook.name}`}
                    onClick={() => void handleTestWebhook(webhook.id)}
                    className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => void handleRotateWebhookSecret(webhook.id)}
                    className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Rotate secret
                  </button>
                  <button
                    onClick={() => void handleLoadDeliveries(webhook.id)}
                    className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
                  >
                    Deliveries
                  </button>
                  <button
                    onClick={() => void handleDeleteWebhook(webhook.id)}
                    className="p-1.5 rounded-lg border border-border hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                {deliveryLogs[webhook.id] && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    {deliveryLogs[webhook.id].length === 0 ? (
                      <p className="text-xs text-muted-foreground">No deliveries yet.</p>
                    ) : (
                      deliveryLogs[webhook.id].map((delivery) => (
                        <div
                          key={delivery.id}
                          className="flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="min-w-0 truncate">
                            {delivery.event} · {delivery.success ? 'Delivered' : 'Failed'}
                            {delivery.replayOf ? ' · Replay' : ''} ·{' '}
                            {delivery.responseStatus ?? 'No response'} · {delivery.attempts}{' '}
                            attempts
                          </span>
                          {!delivery.success && (
                            <button
                              onClick={() => void handleReplayDelivery(webhook.id, delivery.id)}
                              className="shrink-0 underline"
                            >
                              Replay
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {createdOAuth && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm font-medium text-green-700">
            OAuth credentials (copy now — shown once):
          </p>
          <p className="text-xs font-mono mt-2">Client ID: {createdOAuth.clientId}</p>
          <p className="text-xs font-mono break-all">Client Secret: {createdOAuth.clientSecret}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">OAuth Applications</h2>
        <div className="flex gap-2">
          <input
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            placeholder="App name"
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <input
            value={newAppRedirect}
            onChange={(e) => setNewAppRedirect(e.target.value)}
            placeholder="Redirect URI"
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <button
            onClick={() => void handleCreateOAuthApp()}
            className="px-3 py-2 text-xs bg-[hsl(var(--brand))] text-white rounded-lg"
          >
            Create
          </button>
        </div>
        <div className="space-y-3">
          {oauthApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No OAuth apps registered.</p>
          ) : (
            oauthApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20"
              >
                <div>
                  <p className="text-sm font-medium">{app.name}</p>
                  <code className="text-xs text-muted-foreground">{app.clientId}</code>
                </div>
                <button
                  onClick={() => void handleRevokeOAuthApp(app.id)}
                  className="p-2 rounded-lg border border-border hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
