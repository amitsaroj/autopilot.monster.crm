'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  Link as LinkIcon,
  AlertCircle,
  ArrowUpRight,
  Blocks,
  Webhook,
} from 'lucide-react';
import Link from 'next/link';
import {
  shopifyIntegrationService,
  type ShopifyIntegrationStatus,
} from '@/services/shopify-integration.service';

type Integration = {
  id: string;
  name: string;
  category: 'Communication' | 'AI' | 'Payment' | 'CRM' | 'E-commerce';
  description: string;
  availability: 'PLATFORM' | 'MANAGED' | 'UNAVAILABLE' | 'SHOPIFY';
  manageHref?: string;
  iconStr: string;
};

const integrations: Integration[] = [
  {
    id: '1',
    name: 'Stripe',
    category: 'Payment',
    description: 'Manage Autopilot Monster subscription billing and invoices.',
    availability: 'PLATFORM',
    manageHref: '/billing',
    iconStr: '💳',
  },
  {
    id: '2',
    name: 'OpenAI',
    category: 'AI',
    description: 'Configure AI providers and agents in the AI workspace.',
    availability: 'MANAGED',
    manageHref: '/ai/settings',
    iconStr: '🧠',
  },
  {
    id: '3',
    name: 'Twilio',
    category: 'Communication',
    description: 'Configure voice providers and calling in Voice settings.',
    availability: 'MANAGED',
    manageHref: '/voice/settings',
    iconStr: '📞',
  },
  {
    id: '4',
    name: 'Meta WhatsApp',
    category: 'Communication',
    description: 'Manage official WhatsApp Business accounts, campaigns, inbox, and workflows.',
    availability: 'MANAGED',
    manageHref: '/whatsapp/settings',
    iconStr: '💬',
  },
  {
    id: '5',
    name: 'Slack',
    category: 'Communication',
    description: 'Send automated CRM alerts and internal notifications to Slack channels.',
    availability: 'UNAVAILABLE',
    iconStr: '📱',
  },
  {
    id: '6',
    name: 'HubSpot',
    category: 'CRM',
    description: 'Two-way sync for Contacts, Companies, and Deals pipelines.',
    availability: 'UNAVAILABLE',
    iconStr: '🚀',
  },
  {
    id: '7',
    name: 'Shopify',
    category: 'E-commerce',
    description: 'Route supported Shopify cart and order events into your workflows.',
    availability: 'SHOPIFY',
    iconStr: '🛍️',
  },
  {
    id: '8',
    name: 'Anthropic Claude',
    category: 'AI',
    description: 'Alternative LLM powering complex data analysis and long-context processing.',
    availability: 'UNAVAILABLE',
    iconStr: '🤖',
  },
];

const categoryColors: Record<string, string> = {
  Communication: 'bg-blue-100 text-blue-700',
  AI: 'bg-blue-100 text-blue-700',
  Payment: 'bg-emerald-100 text-emerald-700',
  CRM: 'bg-orange-100 text-orange-700',
  'E-commerce': 'bg-pink-100 text-pink-700',
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyIntegrationStatus | null>(null);
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [shopifyBusy, setShopifyBusy] = useState(false);
  const [shopifyError, setShopifyError] = useState<string | null>(null);
  const [shopifyShop, setShopifyShop] = useState('');

  const refreshShopifyStatus = useCallback(async () => {
    setShopifyLoading(true);
    setShopifyError(null);
    try {
      const status = await shopifyIntegrationService.status();
      if (!status) throw new Error('Shopify status response was empty.');
      setShopifyStatus(status);
      setShopifyShop(status.shop ?? '');
    } catch (error) {
      setShopifyError(
        error instanceof Error ? error.message : 'Unable to load Shopify connection status.',
      );
    } finally {
      setShopifyLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshShopifyStatus();
  }, [refreshShopifyStatus]);

  const connectShopify = async () => {
    const shop = shopifyShop.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
      setShopifyError('Enter your Shopify store domain, such as store.myshopify.com.');
      return;
    }

    setShopifyBusy(true);
    setShopifyError(null);
    try {
      const result = await shopifyIntegrationService.connect(shop);
      if (!result?.authorizationUrl)
        throw new Error('Shopify did not return an authorization URL.');
      const authorizationUrl = new URL(result.authorizationUrl);
      if (
        authorizationUrl.protocol !== 'https:' ||
        !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(authorizationUrl.hostname) ||
        authorizationUrl.pathname !== '/admin/oauth/authorize'
      ) {
        throw new Error('Shopify returned an invalid authorization URL.');
      }
      window.location.assign(authorizationUrl.toString());
    } catch (error) {
      setShopifyError(
        error instanceof Error ? error.message : 'Unable to start Shopify authorization.',
      );
      setShopifyBusy(false);
    }
  };

  const disconnectShopify = async () => {
    if (
      !window.confirm(
        'Disconnect this Shopify store? Its automations will stop receiving store events.',
      )
    )
      return;
    setShopifyBusy(true);
    setShopifyError(null);
    try {
      await shopifyIntegrationService.disconnect();
      await refreshShopifyStatus();
    } catch (error) {
      setShopifyError(error instanceof Error ? error.message : 'Unable to disconnect Shopify.');
    } finally {
      setShopifyBusy(false);
    }
  };

  const retryShopifyWebhooks = async () => {
    setShopifyBusy(true);
    setShopifyError(null);
    try {
      await shopifyIntegrationService.syncWebhooks();
      await refreshShopifyStatus();
    } catch (error) {
      setShopifyError(
        error instanceof Error ? error.message : 'Unable to retry Shopify webhook setup.',
      );
    } finally {
      setShopifyBusy(false);
    }
  };

  const categories = ['All', 'Communication', 'AI', 'Payment', 'CRM', 'E-commerce'];

  const filteredIntegrations = integrations.filter(
    (i) =>
      (selectedCategory === 'All' || i.category === selectedCategory) &&
      (i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Workspace Settings
            </Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Integrations</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Integration Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your favorite tools to supercharge the AutopilotMonster AI OS.
          </p>
        </div>

        <Link
          href="/settings/api"
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border hover:bg-muted text-foreground font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          <Webhook className="w-4 h-4" /> Manage Webhooks
        </Link>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-xl bg-background shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((app) => (
          <div
            key={app.id}
            className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center text-2xl border border-border/50 shadow-sm group-hover:scale-105 transition-transform">
                {app.iconStr}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColors[app.category]}`}
              >
                {app.category}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-2">
                {app.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
              {app.name === 'Shopify' && (
                <div className="mt-4 space-y-3" aria-live="polite">
                  {shopifyLoading ? (
                    <p className="text-xs text-muted-foreground">Loading Shopify connection…</p>
                  ) : shopifyError ? (
                    <div
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                      role="alert"
                    >
                      {shopifyError}
                      {!shopifyStatus && (
                        <button
                          type="button"
                          onClick={() => void refreshShopifyStatus()}
                          className="ml-2 font-semibold underline"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  ) : null}

                  {!shopifyLoading && shopifyStatus && !shopifyStatus.configured && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      Shopify connection is not configured on this server. Ask your administrator to
                      finish the Shopify app setup.
                    </p>
                  )}

                  {!shopifyLoading && shopifyStatus?.connected && (
                    <>
                      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
                        <p className="font-semibold">{shopifyStatus.shop}</p>
                        <p className="mt-1 text-muted-foreground">
                          Webhooks:{' '}
                          {shopifyStatus.webhookStatus?.toLowerCase().replace('_', ' ') ??
                            'unknown'}
                        </p>
                        {shopifyStatus.scopes.length > 0 && (
                          <p className="mt-1 break-words text-muted-foreground">
                            Permissions: {shopifyStatus.scopes.join(', ')}
                          </p>
                        )}
                      </div>
                      {shopifyStatus.webhookStatus !== 'READY' && (
                        <button
                          type="button"
                          disabled={shopifyBusy}
                          onClick={() => void retryShopifyWebhooks()}
                          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                        >
                          {shopifyBusy ? 'Retrying webhook setup…' : 'Retry webhook setup'}
                        </button>
                      )}
                    </>
                  )}

                  {!shopifyLoading && shopifyStatus?.lastError && (
                    <p
                      className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                      role="alert"
                    >
                      {shopifyStatus.lastError}
                    </p>
                  )}

                  {!shopifyLoading && shopifyStatus?.configured && !shopifyStatus.connected && (
                    <label className="block text-xs font-medium text-foreground">
                      Shopify store domain
                      <input
                        type="text"
                        autoComplete="url"
                        placeholder="store.myshopify.com"
                        value={shopifyShop}
                        onChange={(event) => setShopifyShop(event.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              {/* Status Indicator */}
              <div className="flex items-center gap-1.5">
                {app.name === 'Shopify' ? (
                  shopifyLoading ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      Checking status…
                    </span>
                  ) : shopifyStatus?.connected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700">Connected</span>
                    </>
                  ) : shopifyStatus?.configured ? (
                    <>
                      <Blocks className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Not Connected
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">Setup Required</span>
                    </>
                  )
                ) : null}
                {app.name !== 'Shopify' && app.availability === 'PLATFORM' && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Platform managed
                  </span>
                )}
                {app.name !== 'Shopify' && app.availability === 'MANAGED' && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Manage in product
                  </span>
                )}
                {app.availability === 'UNAVAILABLE' && (
                  <>
                    <Blocks className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Not available</span>
                  </>
                )}
              </div>

              {/* Action Button */}
              {app.name === 'Shopify' ? (
                shopifyStatus?.connected ? (
                  <button
                    type="button"
                    disabled={shopifyBusy}
                    onClick={() => void disconnectShopify()}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {shopifyBusy ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={shopifyLoading || shopifyBusy || !shopifyStatus?.configured}
                    onClick={() => void connectShopify()}
                    className="text-sm font-medium text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1"
                    title={
                      !shopifyStatus?.configured
                        ? 'Shopify app setup is required on the server'
                        : undefined
                    }
                  >
                    {shopifyBusy ? 'Connecting…' : 'Connect'}{' '}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )
              ) : app.manageHref ? (
                <Link
                  href={app.manageHref}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  {app.availability === 'PLATFORM' ? 'Open billing' : 'Manage'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="This integration does not have a supported connection adapter yet."
                  className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60"
                >
                  Unavailable
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Custom App CTA */}
        <Link
          href="/settings/api"
          className="bg-gradient-to-br from-[hsl(var(--brand))]/5 to-[hsl(280,80%,60%)]/10 border border-[hsl(var(--brand))]/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center text-center h-full group border-dashed"
        >
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center text-[hsl(var(--brand))] shadow-sm mb-4 group-hover:-translate-y-1 transition-transform border border-border">
            <LinkIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground mb-2">Build Custom App</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
            Use AutopilotMonster open developer APIs to build internal connections.
          </p>
          <span className="text-sm font-bold text-[hsl(var(--brand))] group-hover:underline">
            View API Docs &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
