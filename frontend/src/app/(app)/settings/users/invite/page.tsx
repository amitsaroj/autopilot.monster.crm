import Link from 'next/link';
import { TeamInviteForm } from '@/components/settings/team-invite-form';

export default function InviteUserPage() {
  return (
    <div className="space-y-6">
      <Link href="/settings/users" className="text-sm text-muted-foreground hover:text-primary">
        Back to team
      </Link>
      <div>
        <h1 className="page-title">Invite team members</h1>
        <p className="page-description">Give your colleagues access to your workspace.</p>
      </div>
      <TeamInviteForm />
    </div>
  );
}
