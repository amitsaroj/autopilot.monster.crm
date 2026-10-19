'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { billingService, type Plan } from '@/services/billing.service';
import { parseApiData } from '@/lib/api/parse-response';

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await billingService.getPlans();
      const data = parseApiData<Plan[]>(response) ?? response.data;
      if (!Array.isArray(data)) throw new Error('Invalid plans response');
      setPlans(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-4 block">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold text-gray-900 dark:text-white mb-6">
            Plans configured for your business
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Compare currently available plans. WhatsApp provider charges, AI usage, payment
            processing and third-party integration fees may be billed separately where applicable.
          </p>
        </motion.div>

        <div className="mb-8 flex justify-center gap-2" role="group" aria-label="Billing period">
          {(['monthly', 'annual'] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              aria-pressed={billingCycle === cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${billingCycle === cycle ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200'}`}
            >
              {cycle}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="sr-only">Loading plans</span>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm text-red-800 dark:text-red-200">
              Pricing is temporarily unavailable. Please try again.
            </p>
            <button
              type="button"
              onClick={() => void loadPlans()}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
            >
              Retry
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No public plans are available right now. Contact sales for options.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400"
            >
              Contact Sales <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const price = Number(
                billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly,
              );
              const validPrice = Number.isFinite(price) && price >= 0;
              let formattedPrice = 'Contact sales';
              if (validPrice) {
                try {
                  formattedPrice = new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: plan.currency,
                  }).format(price);
                } catch {
                  formattedPrice = `${plan.currency} ${price.toFixed(2)}`;
                }
              }

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="relative flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-white/[0.06] dark:bg-white/[0.03]"
                >
                  <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h2>
                  <p className="mb-6 min-h-10 text-sm text-gray-500 dark:text-gray-400">
                    {plan.description ||
                      'Plan details and entitlements are configured by your provider.'}
                  </p>
                  <div className="mb-8">
                    <span className="text-3xl font-semibold text-gray-900 dark:text-white sm:text-5xl">
                      {formattedPrice}
                    </span>
                    {validPrice && (
                      <span className="ml-2 text-lg text-gray-500">
                        /{billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  <p className="mb-8 flex-1 text-sm text-gray-500 dark:text-gray-400">
                    Plan entitlements and usage limits are applied from the configured billing plan.
                  </p>
                  <Link
                    href="/register"
                    className="mb-8 block w-full rounded-xl border border-gray-200 bg-white py-3 text-center text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
                  >
                    Create an account
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Creating an account does not start a subscription or charge your payment method.
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Need a custom plan?
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Contact sales to discuss requirements and availability.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 font-medium text-blue-700 transition-colors hover:text-blue-500 dark:text-blue-400"
          >
            Contact Sales <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
