import Link from 'next/link';
import { OnboardingShell } from '@/components/onboarding-shell';
import { TeamInviteForm } from '@/components/settings/team-invite-form';

export default function OnboardingInvitePage() {
  return (
    <OnboardingShell step={2}>
      <div className="mb-8">
        <h1 className="page-title">Better work, together.</h1>
        <p className="page-description">Invite the people who will share this workspace.</p>
      </div>
      <TeamInviteForm destination="/onboarding/plan" />
      <Link
        href="/onboarding/plan"
        className="inline-flex mt-6 text-sm text-muted-foreground hover:text-primary"
      >
        Skip for now
      </Link>
    </OnboardingShell>
  );
}
