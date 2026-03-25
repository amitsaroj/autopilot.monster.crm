'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Mail, 
  UserPlus, 
  Loader2, 
  Search,
  MoreVertical,
  Shield,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';
import { userService, User } from '@/services/user.service';
import { rbacService, Role } from '@/services/rbac.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteData, setInviteData] = useState({ email: '', roleId: '' });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userService.getUsers(),
        rbacService.getRoles()
      ]);
      setUsers((usersRes as any).data.data || []);
      setRoles((rolesRes as any).data.data || []);
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.inviteUser(inviteData);
      toast.success('Invitation sent');
      setIsInviteModalOpen(false);
      setInviteData({ email: '', roleId: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-glow-indigo">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your team, roles, and access permissions.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="bg-white dark:bg-card/50 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-border shadow-soft overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-border bg-gray-50/30 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-input bg-white/50 dark:bg-background/50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-card/50 border-b border-gray-200 dark:border-border">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-border whitespace-nowrap">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200/50">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {user.firstName} {user.lastName}
                          {user.email.includes('admin') && <Shield className="w-3 h-3 text-indigo-500" />}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles?.map((role) => (
                        <span key={role} className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800/50">
                          {role}
                        </span>
                      )) || <span className="text-gray-400 text-xs italic">Member</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-border bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Invite Member
              </h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <form onSubmit={handleInvite} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      type="email"
                      value={inviteData.email}
                      onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-input bg-white dark:bg-background text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      placeholder="teammate@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Assign Role</label>
                  <select
                    required
                    value={inviteData.roleId}
                    onChange={e => setInviteData({ ...inviteData, roleId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-input bg-white dark:bg-background text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                  >
                    <option value="">Select a role...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-500/20"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
