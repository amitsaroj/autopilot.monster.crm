'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Check, Zap, Crown, ArrowRight, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { billingService, type Plan, type Subscription } from '@/services/billing.service';
import { parseApiData } from '@/lib/api/parse-response';

function asPlans(value: unknown): Plan[] {
  if (Array.isArray(value)) return value as Plan[];
  if (
    value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as { data: unknown }).data)
  ) {
    return (value as { data: Plan[] }).data;
  }
  return [];
}

export default function BillingUpgradePage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [plansRes, subRes] = await Promise.all([
          billingService.getPlans(),
          billingService.getSubscription().catch(() => null),
        ]);
        setPlans(asPlans(parseApiData(plansRes) ?? plansRes.data));
        if (subRes) {
          setSubscription(parseApiData<Subscription>(subRes) ?? subRes.data ?? null);
        }
      } catch {
        toast.error('Failed to load upgrade options');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setActionLoading(planId);
    try {
      const res = await billingService.createCheckout(planId, billingCycle);
      const url = (parseApiData<{ url: string }>(res) ?? res.data)?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error('Checkout session unavailable');
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Upgrade or downgrade anytime · No lock-in</p>
        <div className="inline-flex items-center gap-2 mt-4 p-1 bg-muted rounded-xl">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${billingCycle === 'MONTHLY' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${billingCycle === 'ANNUAL' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Annual <span className="text-green-500 font-semibold ml-1">-20%</span>
          </button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No plans available. Check billing configuration.
          </p>
          <Link
            href="/billing/plans"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[hsl(246,80%,60%)]"
          >
            View plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isCurrent = subscription?.planId === plan.id;
            const highlight = !isCurrent && index === Math.min(1, plans.length - 1);
            const price =
              billingCycle === 'ANNUAL' ? Number(plan.priceAnnual) : Number(plan.priceMonthly);
            const period = billingCycle === 'ANNUAL' ? '/yr' : '/mo';

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-card p-6 flex flex-col relative ${highlight ? 'border-[hsl(246,80%,60%)] ring-2 ring-[hsl(246,80%,60%)]/20' : 'border-border'}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[hsl(246,80%,60%)] text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Current Plan
                  </div>
                )}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    {index === plans.length - 1 ? (
                      <Crown className="h-5 w-5 text-[hsl(246,80%,60%)]" />
                    ) : (
                      <Zap className="h-5 w-5 text-[hsl(246,80%,60%)]" />
                    )}
                    <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.slug}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.currency || 'USD'}{' '}
                      {Number.isFinite(price) ? price.toLocaleString() : '—'}
                    </span>
                    <span className="text-sm text-muted-foreground">{period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    Monthly billing available
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    Annual billing available
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    Stripe checkout
                  </li>
                </ul>
                <button
                  type="button"
                  disabled={isCurrent || actionLoading === plan.id}
                  onClick={() => void handleUpgrade(plan.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${isCurrent ? 'border border-border bg-muted text-muted-foreground cursor-default' : 'bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white disabled:opacity-60'}`}
                >
                  {actionLoading === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Upgrade to {plan.name}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="font-semibold text-foreground mb-1">Need a custom plan?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enterprise contracts with SSO, custom SLAs, and dedicated support are available through
          sales.
        </p>
        <Link
          href="/billing"
          className="inline-flex px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to billing
        </Link>
      </div>
    </div>
  );
}
