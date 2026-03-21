"use client";

import { useState } from 'react';
import { Shield, ShieldAlert, Key, UserCheck, Search, Filter, Mail, UserPlus, MoreVertical, ShieldCheck, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';

const users = [
  { id: '1', name: 'Amit Saroj', email: 'amit@autopilotmonster.com', role: 'Super Admin', mfa: true, status: 'Active', joined: 'Jan 15, 2024', lastActive: '2 mins ago' },
  { id: '2', name: 'Priya Sharma', email: 'priya@autopilotmonster.com', role: 'Tenant Admin', mfa: true, status: 'Active', joined: 'Feb 10, 2024', lastActive: '1 hr ago' },
  { id: '3', name: 'Alex Kim', email: 'alex@autopilotmonster.com', role: 'Sales Manager', mfa: false, status: 'Active', joined: 'Mar 22, 2024', lastActive: '5 hrs ago' },
  { id: '4', name: 'Sarah Lee', email: 'sarah@autopilotmonster.com', role: 'Sales Rep', mfa: true, status: 'Invited', joined: 'Pending', lastActive: 'Never' },
  { id: '5', name: 'John Doe', email: 'john@autopilotmonster.com', role: 'Support Agent', mfa: false, status: 'Suspended', joined: 'Apr 05, 2024', lastActive: '12 days ago' },
];

const roleStyles: Record<string, string> = {
  'Super Admin': 'bg-purple-100 text-purple-700 border-purple-200',
  'Tenant Admin': 'bg-blue-100 text-blue-700 border-blue-200',
  'Sales Manager': 'bg-teal-100 text-teal-700 border-teal-200',
  'Sales Rep': 'bg-slate-100 text-slate-700 border-slate-200',
  'Support Agent': 'bg-orange-100 text-orange-700 border-orange-200',
};

const statusStyles: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Invited': 'bg-amber-100 text-amber-700',
  'Suspended': 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin Settings</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">User Management</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Users & RBAC</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members, roles, permissions, and security policies.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: '1,248', icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-100' },
          { title: 'Tenant Admins', value: '42', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-100' },
          { title: 'Pending Invites', value: '18', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-100' },
          { title: 'MFA Disabled', value: '156', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg hover:bg-muted text-foreground text-sm font-medium transition-colors bg-background">
          <Filter className="w-4 h-4" /> All Roles
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg hover:bg-muted text-foreground text-sm font-medium transition-colors bg-background">
          <Shield className="w-4 h-4" /> Security Options
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Role & Access</th>
                <th className="px-6 py-4 font-medium">Security (MFA)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-border shadow-inner mt-0.5 shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3"/> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${roleStyles[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.mfa ? (
                      <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                        <Lock className="w-3.5 h-3.5" /> Enabled
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 font-medium text-xs">
                        <Unlock className="w-3.5 h-3.5" /> Disabled <span className="bg-amber-100 text-amber-700 px-1 rounded text-[10px]">Risk</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing <strong>1</strong> to <strong>5</strong> of <strong>1,248</strong> users</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 border border-border rounded-lg bg-background hover:bg-muted transition-colors">Next</button>
          </div>
        </div>

      </div>

      {/* Quick Security Actions */}
      <h3 className="text-lg font-bold text-foreground mt-8">Global Security Policies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Key className="w-5 h-5" /></div>
            <div>
              <h4 className="font-semibold text-foreground">Enforce 2FA (MFA)</h4>
              <p className="text-sm text-muted-foreground mt-1">Require all users across all tenants to configure Multi-Factor Authentication.</p>
            </div>
          </div>
          <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-input transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><ShieldCheck className="w-5 h-5" /></div>
            <div>
              <h4 className="font-semibold text-foreground">Strict Session IP Binding</h4>
              <p className="text-sm text-muted-foreground mt-1">Automatically log out users if their IP address changes during an active session.</p>
            </div>
          </div>
          <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
