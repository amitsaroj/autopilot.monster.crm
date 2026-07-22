export interface StripePlanPrices {
  starterMonthly?: string;
  starterAnnual?: string;
  proMonthly?: string;
  proAnnual?: string;
  enterpriseMonthly?: string;
  enterpriseAnnual?: string;
}

const PLACEHOLDER_PATTERN = /placeholder/i;

export function isPlaceholderStripePriceId(priceId: string | null | undefined): boolean {
  if (!priceId || !priceId.trim()) {
    return true;
  }
  return PLACEHOLDER_PATTERN.test(priceId);
}

export function stripePriceEnvKey(planSlug: string, billingCycle: 'MONTHLY' | 'ANNUAL'): string {
  return `STRIPE_PRICE_${planSlug.toUpperCase()}_${billingCycle}`;
}

export function readStripePriceFromEnv(
  planSlug: string,
  billingCycle: 'MONTHLY' | 'ANNUAL',
): string | null {
  const value = process.env[stripePriceEnvKey(planSlug, billingCycle)]?.trim();
  if (!value || isPlaceholderStripePriceId(value)) {
    return null;
  }
  return value;
}

function envPriceForPlan(
  planSlug: string,
  billingCycle: 'MONTHLY' | 'ANNUAL',
  envPrices: StripePlanPrices,
): string | undefined {
  const slug = planSlug.toUpperCase();
  if (slug === 'STARTER') {
    return billingCycle === 'MONTHLY' ? envPrices.starterMonthly : envPrices.starterAnnual;
  }
  if (slug === 'PRO') {
    return billingCycle === 'MONTHLY' ? envPrices.proMonthly : envPrices.proAnnual;
  }
  if (slug === 'ENTERPRISE') {
    return billingCycle === 'MONTHLY' ? envPrices.enterpriseMonthly : envPrices.enterpriseAnnual;
  }
  return undefined;
}

export function resolveStripePriceId(
  planSlug: string,
  billingCycle: 'MONTHLY' | 'ANNUAL',
  planPriceId: string | null | undefined,
  envPrices: StripePlanPrices = {},
): string | null {
  const fromConfig = envPriceForPlan(planSlug, billingCycle, envPrices);
  if (fromConfig && !isPlaceholderStripePriceId(fromConfig)) {
    return fromConfig;
  }

  const fromEnv = readStripePriceFromEnv(planSlug, billingCycle);
  if (fromEnv) {
    return fromEnv;
  }

  if (planPriceId && !isPlaceholderStripePriceId(planPriceId)) {
    return planPriceId;
  }

  return null;
}

export function stripePriceConfigHint(
  planSlug: string,
  billingCycle: 'MONTHLY' | 'ANNUAL',
): string {
  return `Set ${stripePriceEnvKey(planSlug, billingCycle)} in environment or configure the plan stripe price in admin.`;
}
