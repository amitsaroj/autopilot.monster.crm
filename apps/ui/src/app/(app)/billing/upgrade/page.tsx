import { CreditCard, Check, Zap, Crown, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    desc: 'For small teams getting started',
    features: ['Up to 5 users', '2,500 contacts', 'Basic CRM', 'Email support', '1 pipeline'],
    current: false,
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$199',
    period: '/mo',
    desc: 'For growing sales teams',
    features: ['Up to 25 users', '25,000 contacts', 'Full CRM + Workflows', 'WhatsApp + Voice', 'AI features (basic)', '5 pipelines', 'Priority support'],
    current: false,
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$799',
    period: '/mo',
    desc: 'For large organisations',
    features: ['Unlimited users', 'Unlimited contacts', 'Full feature access', 'Custom AI agents', 'SSO & RBAC', 'Dedicated CSM', 'SLA guarantee', 'Custom integrations'],
    current: true,
    highlight: false,
  },
];

export default function BillingUpgradePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Upgrade or downgrade anytime · No lock-in</p>
        <div className="inline-flex items-center gap-2 mt-4 p-1 bg-muted rounded-xl">
          <button className="px-4 py-1.5 text-sm rounded-lg bg-card font-medium shadow-sm">Monthly</button>
          <button className="px-4 py-1.5 text-sm rounded-lg text-muted-foreground hover:text-foreground transition-colors">Annual <span className="text-green-500 font-semibold ml-1">-20%</span></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl border bg-card p-6 flex flex-col relative ${plan.highlight ? 'border-[hsl(246,80%,60%)] ring-2 ring-[hsl(246,80%,60%)]/20' : 'border-border'}`}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[hsl(246,80%,60%)] text-white text-xs font-semibold rounded-full flex items-center gap-1"><Star className="h-3 w-3" />Most Popular</div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full flex items-center gap-1"><Check className="h-3 w-3" />Current Plan</div>
            )}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                {plan.name === 'Enterprise' ? <Crown className="h-5 w-5 text-[hsl(246,80%,60%)]" /> : <Zap className="h-5 w-5 text-[hsl(246,80%,60%)]" />}
                <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground">{plan.desc}</p>
              <div className="mt-3">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${plan.current ? 'border border-border bg-muted text-muted-foreground cursor-default' : 'bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white'}`}
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : (<><CreditCard className="h-4 w-4" />Upgrade to {plan.name}<ArrowRight className="h-4 w-4" /></>)}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="font-semibold text-foreground mb-1">Need a custom plan?</h2>
        <p className="text-sm text-muted-foreground mb-4">We offer custom contracts for large enterprises with specific needs — on-prem, custom SLAs, white-label, and more.</p>
        <button className="px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">Contact Sales</button>
      </div>
    </div>
  );
}
