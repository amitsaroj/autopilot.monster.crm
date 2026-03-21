import { Users, Target, TrendingUp, DollarSign, BarChart2, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const stats = [
  { label: 'Total Contacts', value: '12,489', change: '+5.2%', up: true, icon: Users, color: 'text-blue-400' },
  { label: 'Active Leads', value: '1,842', change: '+12.1%', up: true, icon: Target, color: 'text-purple-400' },
  { label: 'Open Deals', value: '284', change: '-2.4%', up: false, icon: TrendingUp, color: 'text-green-400' },
  { label: 'Revenue MTD', value: '$142,800', change: '+18.7%', up: true, icon: DollarSign, color: 'text-yellow-400' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Welcome back — here&apos;s what&apos;s happening today</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Activity className="h-4 w-4 inline mr-2" />
            View activity
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              {stat.up ? (
                <ArrowUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts placeholder row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            Revenue Pipeline
          </h2>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
            Revenue chart — connects to /analytics/revenue
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {['New lead from website', 'Deal moved to proposal', 'Call completed with Acme', 'Invoice paid — $4,800', '3 tasks due today'].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(246,80%,60%)] mt-1.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Today tasks + pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Today&apos;s Tasks</h2>
          <ul className="space-y-2">
            {['Follow up with John at TechCorp', 'Review deal proposal for $25k deal', 'Send onboarding email to new contacts', 'Prepare weekly sales report'].map((task, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-foreground">{task}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Pipeline Summary</h2>
          {['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'].map((stage, i) => (
            <div key={stage} className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground w-28">{stage}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(246,80%,60%)] rounded-full transition-all"
                  style={{ width: `${[80, 65, 50, 35, 20][i]}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">{[80, 65, 50, 35, 20][i]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
