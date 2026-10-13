import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

export function OnboardingShell({ step, children }: { step: number; children: React.ReactNode }) {
  const stages = [
    { label: 'Workspace', href: '/onboarding/setup' },
    { label: 'Team', href: '/onboarding/invite' },
    { label: 'Plan', href: '/onboarding/plan' },
  ];
  return (
    <div className="min-h-dvh bg-background px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" aria-label="Autopilot Monster home">
          <BrandLogo />
        </Link>
        <nav
          aria-label="Setup progress"
          className="flex flex-wrap items-center gap-6 my-10 border-b border-border pb-5"
        >
          {stages.map((stage, index) => (
            <Link
              key={stage.href}
              href={stage.href}
              aria-current={step === index + 1 ? 'step' : undefined}
              className={`flex items-center gap-2 text-sm ${step === index + 1 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
            >
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">
                {index + 1}
              </span>
              {stage.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
