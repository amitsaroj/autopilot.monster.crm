'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Webhook, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  developerSettingsService,
  ApiKey,
  WebhookEndpoint,
  OAuthApp,
} from '@/services/developer-settings.service';

export default function SettingsApiPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [oauthApps, setOauthApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [newAppName, setNewAppName] = useState('');
  const [newAppRedirect, setNewAppRedirect] = useState('https://localhost/callback');
  const [createdOAuth, setCreatedOAuth] = useState<{ clientId: string; clientSecret: string } | null>(null);

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
    try {
      const res = await developerSettingsService.createApiKey(newKeyName.trim());
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
        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          API keys grant full access. Never share them publicly or commit them to version control.
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
          <Key className="h-4 w-4 text-[hsl(246,80%,60%)]" />
          <h2 className="text-sm font-semibold">API Keys</h2>
        </div>
        <div className="flex gap-2">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name"
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <button
            onClick={() => void handleCreateKey()}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg"
          >
            <Plus className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
        <div className="space-y-3">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
              <div className="flex-1">
                <p className="text-sm font-medium">{key.name}</p>
                <code className="text-xs font-mono text-muted-foreground">{key.keyPrefix}...</code>
                <p className="text-xs text-muted-foreground mt-1">
                  Created {new Date(key.createdAt).toLocaleDateString()}
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
          <Webhook className="h-4 w-4 text-[hsl(246,80%,60%)]" />
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
                    <p className="text-sm font-mono break-all text-muted-foreground">{webhook.url}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {webhook.events.map((event) => (
                        <span key={event} className="px-2 py-0.5 bg-muted text-xs rounded font-mono">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeleteWebhook(webhook.id)}
                    className="p-1.5 rounded-lg border border-border hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {createdOAuth && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <p className="text-sm font-medium text-green-700">OAuth credentials (copy now — shown once):</p>
          <p className="text-xs font-mono mt-2">Client ID: {createdOAuth.clientId}</p>
          <p className="text-xs font-mono break-all">Client Secret: {createdOAuth.clientSecret}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold">OAuth Applications</h2>
        <div className="flex gap-2">
          <input value={newAppName} onChange={(e) => setNewAppName(e.target.value)} placeholder="App name" className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background" />
          <input value={newAppRedirect} onChange={(e) => setNewAppRedirect(e.target.value)} placeholder="Redirect URI" className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background" />
          <button onClick={() => void handleCreateOAuthApp()} className="px-3 py-2 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg">Create</button>
        </div>
        <div className="space-y-3">
          {oauthApps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No OAuth apps registered.</p>
          ) : (
            oauthApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                <div>
                  <p className="text-sm font-medium">{app.name}</p>
                  <code className="text-xs text-muted-foreground">{app.clientId}</code>
                </div>
                <button onClick={() => void handleRevokeOAuthApp(app.id)} className="p-2 rounded-lg border border-border hover:bg-red-500/10">
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
