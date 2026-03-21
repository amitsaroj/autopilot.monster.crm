import { Building2, Users, CreditCard, BarChart3, AlertTriangle, Shield, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const sections = [
    { label: 'Tenants', href: '/admin/tenants', icon: Building2, value: '142', desc: 'Active tenants', color: 'text-blue-400' },
    { label: 'Users', href: '/admin/users', icon: Users, value: '2,841', desc: 'Total users', color: 'text-green-400' },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, value: '$48.2k', desc: 'MRR', color: 'text-yellow-400' },
    { label: 'System Metrics', href: '/admin/metrics', icon: BarChart3, value: '99.9%', desc: 'Uptime', color: 'text-purple-400' },
    { label: 'Plans', href: '/admin/pricing/plans', icon: CreditCard, value: '4', desc: 'Active plans', color: 'text-pink-400' },
    { label: 'Feature Flags', href: '/admin/feature-flags', icon: Shield, value: '24', desc: 'Flags', color: 'text-orange-400' },
    { label: 'Limits & Runtime', href: '/admin/limits', icon: AlertTriangle, value: '8', desc: 'Limit breaches today', color: 'text-red-400' },
    { label: 'Audit Log', href: '/logs/audit', icon: Activity, value: '14.2k', desc: 'Events today', color: 'text-cyan-400' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-description">Super-admin access — all tenants scope</p>
        </div>
        <Link href="/admin/health" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <Activity className="h-4 w-4 text-green-500" /> System Healthy
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Link key={s.label} href={s.href} className="group stat-card hover:border-[hsl(246,80%,60%)]/50 block">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-4 w-4" /></div>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            <p className="text-xs font-medium text-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>
      {/* Recent alerts */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          Recent Alerts
        </h2>
        {['Tenant acme-corp exceeded API rate limit', 'StartupXYZ storage quota at 89%', 'Payment failed for tenant global-inc — retrying'].map((alert, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
            <span className="text-sm text-muted-foreground">{alert}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
