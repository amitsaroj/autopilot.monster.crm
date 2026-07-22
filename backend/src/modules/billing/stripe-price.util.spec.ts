import {
  isPlaceholderStripePriceId,
  readStripePriceFromEnv,
  resolveStripePriceId,
  stripePriceEnvKey,
} from './stripe-price.util';

describe('stripe-price.util', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('detects placeholder price IDs', () => {
    expect(isPlaceholderStripePriceId('price_starter_monthly_placeholder')).toBe(true);
    expect(isPlaceholderStripePriceId('')).toBe(true);
    expect(isPlaceholderStripePriceId(undefined)).toBe(true);
    expect(isPlaceholderStripePriceId('price_1ABC123')).toBe(false);
  });

  it('builds env key from slug and cycle', () => {
    expect(stripePriceEnvKey('starter', 'MONTHLY')).toBe('STRIPE_PRICE_STARTER_MONTHLY');
    expect(stripePriceEnvKey('PRO', 'ANNUAL')).toBe('STRIPE_PRICE_PRO_ANNUAL');
  });

  it('reads valid price from environment', () => {
    process.env.STRIPE_PRICE_STARTER_MONTHLY = 'price_live_starter_m';
    expect(readStripePriceFromEnv('STARTER', 'MONTHLY')).toBe('price_live_starter_m');
  });

  it('ignores placeholder values in environment', () => {
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly_placeholder';
    expect(readStripePriceFromEnv('PRO', 'MONTHLY')).toBeNull();
  });

  it('prefers config prices over DB plan prices', () => {
    const resolved = resolveStripePriceId(
      'STARTER',
      'MONTHLY',
      'price_db_fallback',
      { starterMonthly: 'price_config_starter_m' },
    );
    expect(resolved).toBe('price_config_starter_m');
  });

  it('falls back to DB plan price when env unset', () => {
    const resolved = resolveStripePriceId('PRO', 'ANNUAL', 'price_db_pro_a', {});
    expect(resolved).toBe('price_db_pro_a');
  });

  it('returns null when no valid price is configured', () => {
    expect(resolveStripePriceId('ENTERPRISE', 'MONTHLY', 'price_ent_monthly_placeholder', {})).toBeNull();
  });
});
