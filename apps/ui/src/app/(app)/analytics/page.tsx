import { BarChart2, TrendingUp, Users, DollarSign, Target, PieChart, Download } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const sections = [
    { label: 'CRM Analytics', href: '/analytics/crm', icon: Users, desc: 'Contacts, leads, deal conversion', color: 'from-blue-500 to-cyan-500' },
    { label: 'Revenue Analytics', href: '/analytics/revenue', icon: DollarSign, desc: 'MRR, ARR, churn, forecast', color: 'from-green-500 to-emerald-500' },
    { label: 'Pipeline Analytics', href: '/analytics/pipeline', icon: TrendingUp, desc: 'Stage conversion funnels', color: 'from-purple-500 to-violet-500' },
    { label: 'Team Performance', href: '/analytics/team', icon: Target, desc: 'Per-rep metrics and goals', color: 'from-orange-500 to-amber-500' },
    { label: 'Custom Reports', href: '/analytics/reports', icon: PieChart, desc: 'Build and schedule reports', color: 'from-pink-500 to-rose-500' },
    { label: 'Dashboards', href: '/analytics/dashboards', icon: BarChart2, desc: 'Custom dashboard builder', color: 'from-indigo-500 to-blue-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">Business intelligence and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/analytics/export" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export
          </Link>
          <Link href="/analytics/dashboards/new" className="px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            New Dashboard
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: '$142,800', change: '+18.7%', up: true },
          { label: 'New Contacts', value: '842', change: '+5.2%', up: true },
          { label: 'Deal Win Rate', value: '34%', change: '-2.1%', up: false },
          { label: 'Avg Response Time', value: '4.2h', change: '-12%', up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            <span className={`text-xs font-medium ${kpi.up ? 'text-green-500' : 'text-red-500'}`}>{kpi.change} vs last month</span>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-xl border border-border bg-card p-6 hover:border-[hsl(246,80%,60%)]/50 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-[hsl(246,80%,60%)] transition-colors">{s.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
