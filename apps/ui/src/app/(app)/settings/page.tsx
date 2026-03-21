import Link from 'next/link';
import { User, Building2, Users, Shield, Code, Plug, Bell, Database } from 'lucide-react';

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { label: 'Profile', desc: 'Personal info and avatar', href: '/settings/profile', icon: User },
      { label: 'Password & Security', desc: 'MFA, sessions, login history', href: '/settings/password', icon: Shield },
      { label: 'Notifications', desc: 'Email, push, in-app preferences', href: '/settings/notifications', icon: Bell },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Workspace Settings', desc: 'Name, logo, branding, timezone', href: '/settings/workspace', icon: Building2 },
      { label: 'Members & Roles', desc: 'Invite users, manage roles', href: '/settings/users', icon: Users },
      { label: 'SSO & Security', desc: 'SAML, IP allowlist, session policy', href: '/settings/workspace/sso', icon: Shield },
    ],
  },
  {
    title: 'Developer',
    items: [
      { label: 'API Keys', desc: 'Manage access tokens and webhooks', href: '/settings/api', icon: Code },
      { label: 'Integrations', desc: 'Connected apps and services', href: '/settings/integrations', icon: Plug },
      { label: 'Data & Privacy', desc: 'Export, retention, GDPR', href: '/settings/data', icon: Database },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage your account and workspace preferences</p>
      </div>
      {settingsGroups.map((group) => (
        <div key={group.title}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.title}</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
            {group.items.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group">
                <div className="p-2.5 rounded-lg bg-muted group-hover:bg-[hsl(246,80%,60%)]/10 transition-colors">
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <div className="text-muted-foreground text-xs">›</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
