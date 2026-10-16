'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  whatsappAutomationService,
  type AutomationProduct,
} from '@/services/whatsapp-automation.service';
import { useResource } from './use-resource';
import {
  PageHeading,
  Notice,
  Loading,
  StatusBadge,
  Field,
  inputClass,
  panelClass,
  secondaryClass,
} from './ui';

export function automationPrice(product: AutomationProduct): string {
  if (product.pricing.model === 'PAID') return 'Paid automation · price confirmed at checkout';
  return product.pricing.model === 'FREE' ? 'Free' : 'Included with an eligible subscription';
}

function CheckoutNotice() {
  const checkout = useSearchParams().get('checkout');
  if (checkout === 'complete')
    return (
      <Notice>
        Checkout returned. Access becomes available after payment confirmation; open your automation
        to install it. If confirmation is still pending, retry after a moment.
      </Notice>
    );
  if (checkout === 'canceled')
    return <Notice>Checkout was canceled. No automation was installed.</Notice>;
  return null;
}

export default function AutomationCatalog({ publicView = false }: { publicView?: boolean }) {
  const products = useResource(whatsappAutomationService.catalog);
  const coverage = useResource(whatsappAutomationService.coverage);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const categories = [...new Set(products.data?.map((product) => product.category) ?? [])];
  const filtered =
    products.data?.filter(
      (product) =>
        (!category || product.category === category) &&
        (!availableOnly || (product.availability === 'IMPLEMENTED' && !!product.id)) &&
        `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  return (
    <div className="space-y-6">
      <PageHeading
        title="WhatsApp automation catalog"
        description="Choose a business outcome, review the prerequisites, then configure an automation for your workspace."
        action={
          <Link
            className={secondaryClass}
            href={publicView ? '/whatsapp/automations' : '/whatsapp/automations/installed'}
          >
            {publicView ? 'Open your workspace' : 'My automations'}
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Field label="Find an automation">
          <input
            className={inputClass}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Support, sales, appointments…"
          />
        </Field>
        <Field label="Category">
          <select
            className={inputClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(event) => setAvailableOnly(event.target.checked)}
        />
        Show installable automations only
      </label>
      <Notice>
        Subscription eligibility is checked before installation and activation. Meta messaging, AI
        usage and external service fees are separate where applicable.
      </Notice>
      <Suspense fallback={null}>
        <CheckoutNotice />
      </Suspense>
      <details className={panelClass}>
        <summary className="cursor-pointer text-sm font-semibold">
          Supported categories and integration requirements
        </summary>
        <p className="mt-3 text-sm text-muted-foreground">
          A listed pack supports the outcome described on its detail page, not every feature in its
          category. Additional requirements are shown explicitly.
        </p>
        {coverage.error && <Notice error>{coverage.error}</Notice>}
        <div className="mt-4 divide-y divide-border">
          {coverage.data?.map((area) => (
            <section key={area.key} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">{area.name}</h2>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {area.support === 'PACK_AVAILABLE'
                    ? 'Starter pack defined'
                    : 'Integration required'}
                </span>
              </div>
              {area.productSlugs.some((slug) => {
                const product = products.data?.find((item) => item.slug === slug);
                return product && !product.id;
              }) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Some starter packs still need an active marketplace catalog entry before they can
                  be installed.
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {area.productSlugs.map((slug) => {
                  const product = products.data?.find((item) => item.slug === slug);
                  return product ? (
                    <Link
                      className="text-xs text-primary underline"
                      href={`${publicView ? '/product/whatsapp/automations' : '/whatsapp/automations'}/${slug}`}
                      key={slug}
                    >
                      {product.name}
                    </Link>
                  ) : null;
                })}
              </div>
              {area.externalRequirements.map((requirement) => (
                <p key={requirement.key} className="mt-2 text-xs text-muted-foreground">
                  {requirement.label}: {requirement.description}
                </p>
              ))}
            </section>
          ))}
        </div>
      </details>
      {products.loading && <Loading />}
      {products.error && (
        <Notice error>
          {products.error}{' '}
          <button className="underline" onClick={() => void products.reload()}>
            Retry
          </button>
        </Notice>
      )}
      {!products.loading && !products.error && filtered.length === 0 && (
        <Notice>No automations match your filters. Try another category or search.</Notice>
      )}
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {filtered.map((product) => (
          <article key={product.slug} className="grid gap-4 p-5 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {product.category.replaceAll('_', ' ')}
              </p>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">{product.description}</p>
              <p className="text-xs text-muted-foreground">
                {product.steps.join(' → ') || 'External integration required'}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <StatusBadge
                value={
                  product.availability === 'EXTERNAL_REQUIRED'
                    ? 'Integration required'
                    : product.id
                      ? 'Available'
                      : 'Catalog setup required'
                }
              />
              <p className="text-xs text-muted-foreground">{automationPrice(product)}</p>
              <Link
                className={secondaryClass}
                href={`${publicView ? '/product/whatsapp/automations' : '/whatsapp/automations'}/${product.slug}`}
              >
                View requirements
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className={panelClass}>
        <h2 className="font-semibold">Need a custom workflow?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the existing workflow builder to connect supported WhatsApp and CRM actions.
        </p>
        <Link className={`${secondaryClass} mt-3`} href="/whatsapp/flow-builder">
          Open workflow builder
        </Link>
      </div>
    </div>
  );
}
