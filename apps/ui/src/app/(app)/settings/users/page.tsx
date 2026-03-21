import { Plus, Users, Shield, Search, MoreHorizontal, Crown, UserCheck, User, Mail } from 'lucide-react';
import Link from 'next/link';

const members = [
  { name: 'Amit Saroj', email: 'autopilot.monster@gmail.com', role: 'Super Admin', status: 'Active', joined: 'Jan 2024', avatar: 'A' },
  { name: 'Priya Sharma', email: 'autopilot.monster@gmail.com', role: 'Admin', status: 'Active', joined: 'Feb 2024', avatar: 'P' },
  { name: 'Alex Kim', email: 'autopilot.monster@gmail.com', role: 'Sales Manager', status: 'Active', joined: 'Mar 2024', avatar: 'A' },
  { name: 'Sarah Lee', email: 'autopilot.monster@gmail.com', role: 'Sales Rep', status: 'Active', joined: 'Apr 2024', avatar: 'S' },
  { name: 'John Doe', email: 'autopilot.monster@gmail.com', role: 'Sales Rep', status: 'Invited', joined: 'Pending', avatar: 'J' },
];

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]',
  'Admin': 'bg-blue-500/10 text-blue-400',
  'Sales Manager': 'bg-purple-500/10 text-purple-400',
  'Sales Rep': 'bg-muted text-muted-foreground',
};

export default function SettingsUsersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Members & Roles</h1>
          <p className="page-description">5 members · 2 seats available</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings/roles" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Shield className="h-4 w-4" /> Manage Roles</Link>
          <Link href="/settings/users/invite" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Plus className="h-4 w-4" /> Invite Member</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: '5', icon: Users },
          { label: 'Active', value: '4', icon: UserCheck },
          { label: 'Seats Used', value: '5 / 7', icon: Crown },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted text-[hsl(246,80%,60%)]"><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search members..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr key={m.email} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-sm font-bold text-[hsl(246,80%,60%)]">{m.avatar}</div>
                    <div>
                      <p className="font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[m.role]}`}>{m.role}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{m.status}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.joined}</td>
                <td className="px-4 py-3"><button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
