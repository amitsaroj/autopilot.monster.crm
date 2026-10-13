import Link from 'next/link';
import { OnboardingShell } from '@/components/onboarding-shell';
import { PlanPicker } from '@/components/billing/plan-picker';

export default function OnboardingPlanPage() {
  return (
    <OnboardingShell step={3}>
      <PlanPicker title="Choose your workspace plan" />
      <Link href="/dashboard" className="product-button product-button-secondary mt-8">
        Continue to dashboard
      </Link>
    </OnboardingShell>
  );
}
