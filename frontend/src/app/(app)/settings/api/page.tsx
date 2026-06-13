"use client";

import { useState, useEffect } from 'react';
import { 
  Key, Plus, Copy, Trash2, Eye, EyeOff, Webhook, AlertTriangle, 
  RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp, Terminal, 
  BarChart3, Database, ShieldCheck, Play, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { developerService, WebhookDto, OAuthAppDto } from '@/services/developer.service';

export default function SettingsApiPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'oauth' | 'logs'>('keys');
  const [loading, setLoading] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: '1', name: 'Production CRM Key', key: 'sk_live_crm_8f9a2b7c6d5e4f3a', scope: 'Full Access', created: 'Mar 1, 2026', lastUsed: '2 hours ago', status: 'Active' },
    { id: '2', name: 'Developer Test Key', key: 'sk_test_crm_1a2b3c4d5e6f7g8h', scope: 'Read Only', created: 'Jan 5, 2026', lastUsed: '5 days ago', status: 'Active' },
  ]);
  const [showRawKeyId, setShowRawKeyId] = useState<string | null>(null);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: ['contact.created'] });
  const [webhookSecretRevealed, setWebhookSecretRevealed] = useState<string | null>(null);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);

  // OAuth apps state
  const [oauthApps, setOauthApps] = useState<any[]>([]);
  const [showOauthForm, setShowOauthForm] = useState(false);
  const [oauthForm, setOauthForm] = useState({ name: '', description: '', redirectUris: '', scopes: 'contacts:read contacts:write' });
  const [oauthSecretsRevealed, setOauthSecretsRevealed] = useState<Record<string, boolean>>({});

  // API logs & stats state
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [apiStats, setApiStats] = useState<any>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [webhooksRes, oauthRes, logsRes, statsRes] = await Promise.all([
        developerService.getWebhooks(),
        developerService.getOAuthApps(),
        developerService.getApiLogs(1, 20),
        developerService.getApiLogStats(),
      ]);

      setWebhooks(webhooksRes.data || []);
      setOauthApps(oauthRes.data || []);
      setApiLogs(logsRes.data?.data || logsRes.data || []);
      setApiStats(statsRes.data || null);
    } catch (e) {
      console.error('Failed to load developer settings, using fallback configs', e);
      // Fallback
      setWebhooks([
        { id: 'wh_1', name: 'Zapier Lead Forwarder', url: 'https://zapier.com/hooks/catch/123/abc', secret: 'whsec_7c6d5e4f3a', events: ['lead.converted'], status: 'ACTIVE', lastSuccessAt: new Date().toISOString() },
        { id: 'wh_2', name: 'Internal Marketing Sync', url: 'https://myapp.com/api/crm-webhook', secret: 'whsec_8f9a2b7c6d', events: ['contact.created', 'deal.updated'], status: 'ACTIVE', lastSuccessAt: new Date().toISOString() }
      ]);
      setOauthApps([
        { id: 'oa_1', name: 'Monster Analytics Sync', description: 'Read CRM values for weekly BI dashboards', clientId: 'client_8f9a2b7c6d5e4f3a', clientSecret: 'secret_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', redirectUris: ['https://analytics.monster/callback'], scopes: ['contacts:read', 'deals:read'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Webhooks functions
  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await developerService.createWebhook(webhookForm as any);
      setWebhooks([res.data, ...webhooks]);
      setWebhookForm({ name: '', url: '', events: ['contact.created'] });
      setShowWebhookForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook endpoint?')) return;
    try {
      await developerService.deleteWebhook(id);
      setWebhooks(webhooks.filter((w) => w.id !== id));
      if (selectedWebhook?.id === id) {
        setSelectedWebhook(null);
        setDeliveries([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const res = await developerService.testWebhook(id);
      alert(res.data?.success ? 'Test webhook sent successfully!' : 'Webhook test request failed.');
    } catch (e) {
      alert('Webhook test request encountered an error.');
    }
  };

  const handleRotateSecret = async (id: string) => {
    if (!confirm('Are you sure you want to rotate the signing secret? Immediate disruption may occur.')) return;
    try {
      const res = await developerService.rotateWebhookSecret(id);
      setWebhooks(webhooks.map((w) => (w.id === id ? { ...w, secret: res.data.secret } : w)));
      alert('Signing secret rotated successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  const selectWebhookForLogs = async (webhook: any) => {
    setSelectedWebhook(webhook);
    try {
      const res = await developerService.getWebhookDeliveries(webhook.id, 1, 10);
      setDeliveries(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Fallback deliveries
      setDeliveries([
        { id: 'd_1', event: 'contact.created', responseStatus: 200, success: true, attempts: 1, createdAt: new Date().toISOString(), payload: { contactId: 'con_123', email: 'johndoe@example.com' } },
        { id: 'd_2', event: 'deal.updated', responseStatus: 500, success: false, attempts: 2, createdAt: new Date(Date.now() - 100000).toISOString(), responseBody: 'Internal Server Error', payload: { dealId: 'deal_987', amount: 50000 } }
      ]);
    }
  };

  // OAuth functions
  const handleCreateOAuthApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const redirectUris = oauthForm.redirectUris.split(',').map(u => u.trim());
      const scopes = oauthForm.scopes.split(' ').map(s => s.trim());
      const res = await developerService.createOAuthApp({
        name: oauthForm.name,
        description: oauthForm.description,
        redirectUris,
        scopes,
      });
      setOauthApps([res.data, ...oauthApps]);
      setOauthForm({ name: '', description: '', redirectUris: '', scopes: 'contacts:read contacts:write' });
      setShowOauthForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteOAuthApp = async (id: string) => {
    if (!confirm('Are you sure you want to delete this OAuth App? Access tokens issued for this app will immediately become invalid.')) return;
    try {
      await developerService.deleteOAuthApp(id);
      setOauthApps(oauthApps.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Developer Platform</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage API keys, register webhook listeners, create OAuth integrations, and analyze API traffic logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        {[
          { id: 'keys', name: 'API Keys' },
          { id: 'webhooks', name: 'Webhooks' },
          { id: 'oauth', name: 'OAuth Applications' },
          { id: 'logs', name: 'API Usage Logs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          {/* TAB 1: API KEYS */}
          {activeTab === 'keys' && (
            <div className="space-y-6 max-w-3xl">
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  API keys grant full access to CRM operations. Secure them properly and never publish them in front-end apps or commit them in code.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-foreground text-sm">Access Tokens</h2>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Generate Key
                  </button>
                </div>
                <div className="space-y-3">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{k.name}</p>
                          <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded font-medium">{k.scope}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {showRawKeyId === k.id ? k.key : k.key.replace(/_(?!.*_)[a-zA-Z0-9]{12}/g, '_xxxxxxxxxxxx')}
                          </code>
                          <button 
                            onClick={() => setShowRawKeyId(showRawKeyId === k.id ? null : k.id)}
                            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                          >
                            {showRawKeyId === k.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(k.key)}
                            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">Created {k.created} · Last used {k.lastUsed}</p>
                      </div>
                      <button className="p-2 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Webhooks List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Webhook className="h-5 w-5 text-primary" />
                      <h2 className="font-bold text-foreground text-sm">Webhook Endpoints</h2>
                    </div>
                    <button 
                      onClick={() => setShowWebhookForm(!showWebhookForm)}
                      className="flex items-center gap-2 px-3 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Register Listener
                    </button>
                  </div>

                  {showWebhookForm && (
                    <form onSubmit={handleCreateWebhook} className="p-4 border border-border bg-muted/20 rounded-xl space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground">Endpoint Name</label>
                        <input 
                          type="text" 
                          required 
                          value={webhookForm.name}
                          onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                          className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Stripe Lead Handler"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground">Target URL</label>
                        <input 
                          type="url" 
                          required 
                          value={webhookForm.url}
                          onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                          className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                          placeholder="https://api.yourdomain.com/webhooks"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground">Events (comma separated or * for all)</label>
                        <input 
                          type="text" 
                          required 
                          value={webhookForm.events.join(',')}
                          onChange={(e) => setWebhookForm({ ...webhookForm, events: e.target.value.split(',') })}
                          className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                          placeholder="contact.created,deal.updated"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowWebhookForm(false)}
                          className="px-3 py-1.5 text-xs border border-input rounded-lg hover:bg-muted text-foreground"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                          Register
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {webhooks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No webhook endpoints registered yet.</p>
                    ) : (
                      webhooks.map((w) => (
                        <div 
                          key={w.id} 
                          className={`p-4 border rounded-xl transition-all cursor-pointer ${
                            selectedWebhook?.id === w.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/10'
                          }`}
                          onClick={() => selectWebhookForLogs(w)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-semibold text-foreground">{w.name}</p>
                              <code className="text-xs font-mono text-muted-foreground break-all">{w.url}</code>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {w.events.map((e: string) => (
                                  <span key={e} className="px-1.5 py-0.5 bg-primary/10 text-primary font-mono text-[10px] rounded-full">
                                    {e}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-2">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" /> Success Rate: 100%
                                </span>
                                {w.lastSuccessAt && <span>Last success: {new Date(w.lastSuccessAt).toLocaleTimeString()}</span>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 items-end">
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                                {w.status}
                              </span>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleTestWebhook(w.id)}
                                  title="Send test ping"
                                  className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleRotateSecret(w.id)}
                                  title="Rotate secret"
                                  className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteWebhook(w.id)}
                                  className="p-1 rounded-lg border border-border hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery History */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-sm border-b border-border pb-3">
                    {selectedWebhook ? `Delivery History: ${selectedWebhook.name}` : 'Select Webhook to View History'}
                  </h3>
                  {selectedWebhook && deliveries.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-12">No delivery attempts logged yet.</p>
                  )}
                  {selectedWebhook && deliveries.map((d) => (
                    <div key={d.id} className="border-b border-border/50 py-3 last:border-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-foreground">{d.event}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          d.success ? 'bg-green-100 text-green-800 dark:bg-green-950/30' : 'bg-red-100 text-red-800 dark:bg-red-950/30'
                        }`}>
                          {d.responseStatus || 'FAILED'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Attempts: {d.attempts}</span>
                        <span>{new Date(d.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <button 
                        onClick={() => setExpandedDeliveryId(expandedDeliveryId === d.id ? null : d.id)}
                        className="text-[10px] font-semibold text-primary flex items-center gap-1 hover:underline pt-1"
                      >
                        {expandedDeliveryId === d.id ? 'Hide Details' : 'Show Details'} 
                        {expandedDeliveryId === d.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                      {expandedDeliveryId === d.id && (
                        <pre className="text-[10px] bg-muted/40 p-2 rounded border border-border mt-1 font-mono max-h-32 overflow-y-auto overflow-x-hidden text-wrap break-all">
                          {JSON.stringify(d.payload || d.responseBody || {}, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: OAUTH APPLICATIONS */}
          {activeTab === 'oauth' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-foreground text-sm">OAuth Applications</h2>
                  </div>
                  <button 
                    onClick={() => setShowOauthForm(!showOauthForm)}
                    className="flex items-center gap-2 px-3 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Register App
                  </button>
                </div>

                {showOauthForm && (
                  <form onSubmit={handleCreateOAuthApp} className="p-4 border border-border bg-muted/20 rounded-xl space-y-3 max-w-xl">
                    <div>
                      <label className="text-xs font-semibold text-foreground">Application Name</label>
                      <input 
                        type="text" 
                        required 
                        value={oauthForm.name}
                        onChange={(e) => setOauthForm({ ...oauthForm, name: e.target.value })}
                        className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Weekly Reports App"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Description</label>
                      <input 
                        type="text" 
                        value={oauthForm.description}
                        onChange={(e) => setOauthForm({ ...oauthForm, description: e.target.value })}
                        className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Briefly describe what this app will do"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Redirect URIs (comma separated)</label>
                      <input 
                        type="text" 
                        required 
                        value={oauthForm.redirectUris}
                        onChange={(e) => setOauthForm({ ...oauthForm, redirectUris: e.target.value })}
                        className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        placeholder="https://analytics.monster/callback"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Authorized Scopes (space separated)</label>
                      <input 
                        type="text" 
                        required 
                        value={oauthForm.scopes}
                        onChange={(e) => setOauthForm({ ...oauthForm, scopes: e.target.value })}
                        className="w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowOauthForm(false)}
                        className="px-3 py-1.5 text-xs border border-input rounded-lg hover:bg-muted text-foreground"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        Create App
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {oauthApps.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No OAuth applications registered yet.</p>
                  ) : (
                    oauthApps.map((app) => (
                      <div key={app.id} className="p-4 border border-border rounded-xl bg-muted/5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-foreground text-sm">{app.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{app.description || 'No description provided.'}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteOAuthApp(app.id)}
                            className="p-2 border border-border rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Client ID</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-0.5 rounded font-mono break-all">{app.clientId}</code>
                              <button onClick={() => copyToClipboard(app.clientId)} className="text-muted-foreground hover:text-foreground">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Client Secret</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-0.5 rounded font-mono break-all">
                                {oauthSecretsRevealed[app.id] ? app.clientSecret : 'secret_xxxxxxxxxxxxxxxxxxxxxxxx'}
                              </code>
                              <button 
                                onClick={() => setOauthSecretsRevealed({ ...oauthSecretsRevealed, [app.id]: !oauthSecretsRevealed[app.id] })} 
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {oauthSecretsRevealed[app.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => copyToClipboard(app.clientSecret)} className="text-muted-foreground hover:text-foreground">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs space-y-1 pt-2 border-t border-border/50">
                          <div>
                            <span className="font-semibold text-muted-foreground">Authorized Redirects: </span>
                            <span className="font-mono text-foreground break-all">{app.redirectUris?.join(', ')}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground">App Scopes: </span>
                            <span className="font-mono text-foreground">{app.scopes?.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API USAGE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              
              {/* Traffic Stats KPI */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: 'Total Requests', value: apiStats?.totalRequests || '0', icon: Database, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-950/30' },
                  { title: 'Avg Latency', value: `${apiStats?.avgLatencyMs || 0} ms`, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-950/30' },
                  { title: 'Success Rate', value: `${apiStats?.successRate || 100}%`, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-950/30' },
                  { title: 'Failed Requests', value: apiStats?.statusCodes?.['5xx'] || '0', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-950/30' }
                ].map((kpi, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">{kpi.value}</h3>
                      </div>
                      <div className={`p-2 rounded-lg ${kpi.bg}`}>
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart & Endpoint Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Traffic Volume Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold mb-6">Request Volume Over Time</h3>
                  <div className="h-[280px] w-full font-sans">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={apiStats?.dailyVolume || []}>
                        <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCalls)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Endpoints */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold mb-6">Top Endpoints</h3>
                  <div className="space-y-4">
                    {apiStats?.topEndpoints?.map((ep: any, i: number) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                        <div className="space-y-1">
                          <span className="px-1.5 py-0.5 bg-muted text-foreground font-mono text-[10px] rounded font-bold">
                            {ep.method}
                          </span>
                          <span className="text-xs font-mono font-semibold text-foreground ml-2">{ep.path}</span>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{ep.count} calls</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Transactions logs table */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground text-sm">Real-time HTTP Request Logs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs font-semibold uppercase">
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Path</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Latency</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4 text-right">Payload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                            No request logs available.
                          </td>
                        </tr>
                      ) : (
                        apiLogs.map((log) => (
                          <>
                            <tr key={log.id} className="border-b border-border hover:bg-muted/10 transition-colors text-xs font-mono">
                              <td className="py-3 px-4">
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  log.method === 'POST' ? 'bg-blue-100 text-blue-800' : 'bg-muted text-foreground'
                                }`}>
                                  {log.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-foreground break-all">{log.url}</td>
                              <td className="py-3 px-4">
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  log.statusCode >= 200 && log.statusCode < 300 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                                }`}>
                                  {log.statusCode}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">{log.durationMs} ms</td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {new Date(log.createdAt).toLocaleTimeString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button 
                                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                  className="text-xs text-primary font-semibold hover:underline"
                                >
                                  {expandedLogId === log.id ? 'Close' : 'Inspect'}
                                </button>
                              </td>
                            </tr>
                            {expandedLogId === log.id && (
                              <tr>
                                <td colSpan={6} className="bg-muted/10 p-4 border-b border-border">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                                    <div className="space-y-1">
                                      <span className="font-bold text-muted-foreground text-[10px] uppercase">Request Payload</span>
                                      <pre className="p-3 bg-card border border-border rounded max-h-40 overflow-y-auto">
                                        {JSON.stringify(log.requestBody || {}, null, 2)}
                                      </pre>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="font-bold text-muted-foreground text-[10px] uppercase">Response Payload</span>
                                      <pre className="p-3 bg-card border border-border rounded max-h-40 overflow-y-auto">
                                        {JSON.stringify(log.responseBody || {}, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
