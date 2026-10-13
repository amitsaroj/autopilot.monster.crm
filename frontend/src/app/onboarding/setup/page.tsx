import Link from 'next/link';
import { OnboardingShell } from '@/components/onboarding-shell';
import { WorkspaceSettings } from '@/components/settings/workspace-settings';

export default function OnboardingSetupPage() {
  return (
    <OnboardingShell step={1}>
      <WorkspaceSettings />
      <Link href="/onboarding/invite" className="product-button product-button-primary mt-6">
        Continue to team setup
      </Link>
    </OnboardingShell>
  );
}
