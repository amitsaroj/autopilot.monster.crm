import { Users, Plus, Search, MoreHorizontal, Shield, Mail, UserCheck } from 'lucide-react';
import Link from 'next/link';

const users = [
  { id: 1, name: 'Amit Saroj', email: 'amit@autopilotmonster.com', tenant: 'AutopilotMonster (Self)', role: 'Super Admin', status: 'Active', joined: 'Jan 2024' },
  { id: 2, name: 'Priya Sharma', email: 'priya@autopilotmonster.com', tenant: 'AutopilotMonster', role: 'Admin', status: 'Active', joined: 'Feb 2024' },
  { id: 3, name: 'Sarah Johnson', email: 'sarah@techcorp.com', tenant: 'TechCorp Workspace', role: 'Sales Manager', status: 'Active', joined: 'Mar 2024' },
  { id: 4, name: 'Mike Braun', email: 'mike@globalmanuf.com', tenant: 'GlobalManufacturing', role: 'Sales Rep', status: 'Active', joined: 'Mar 2024' },
  { id: 5, name: 'Raj Patel', email: 'raj@startupxyz.co', tenant: 'StartupXYZ', role: 'Admin', status: 'Trial', joined: 'Oct 2024' },
];

const roleColor: Record<string, string> = {
  'Super Admin': 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]',
  'Admin': 'bg-blue-500/10 text-blue-400',
  'Sales Manager': 'bg-purple-500/10 text-purple-400',
  'Sales Rep': 'bg-muted text-muted-foreground',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Users</h1>
          <p className="page-description">Super-admin view of all users across all tenants</p>
        </div>
        <Link href="/admin/users/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Plus className="h-4 w-4" />New User</Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: '88', icon: Users, color: 'text-blue-400' },
          { label: 'Active', value: '82', icon: UserCheck, color: 'text-green-400' },
          { label: 'Admins', value: '6', icon: Shield, color: 'text-[hsl(246,80%,60%)]' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search users..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">{u.name[0]}</div>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{u.tenant}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role] || 'bg-muted text-muted-foreground'}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{u.status}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.joined}</td>
                <td className="px-4 py-3"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
