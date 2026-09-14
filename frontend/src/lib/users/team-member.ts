type ApiRole = string | { name?: string };

interface ApiUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  status?: string;
  lastLoginAt?: string;
  roles?: ApiRole[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'DEACTIVATED';
  lastLogin?: string;
}

const statusByApiValue: Record<string, TeamMember['status']> = {
  active: 'ACTIVE',
  pending_verification: 'PENDING',
  inactive: 'DEACTIVATED',
  suspended: 'DEACTIVATED',
};

function roleName(role: ApiRole | undefined): string | undefined {
  return typeof role === 'string' ? role : role?.name;
}

export function toTeamMember(user: ApiUser): TeamMember {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return {
    id: user.id,
    name,
    email: user.email,
    role: roleName(user.roles?.[0]) ?? 'TEAM_MEMBER',
    status: statusByApiValue[user.status ?? ''] ?? 'PENDING',
    lastLogin: user.lastLoginAt,
  };
}
