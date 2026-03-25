'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Loader2, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  UserPlus
} from 'lucide-react';
import { userService, User } from '@/services/user.service';
import { rbacService, Role } from '@/services/rbac.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function UserRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await rbacService.assignRole(userId, roleId);
      toast.success('Role assigned');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  const handleRevokeRole = async (userId: string, roleId: string) => {
    try {
      await rbacService.revokeRole(userId, roleId);
      toast.success('Role revoked');
      fetchData();
    } catch (error) {
      toast.error('Failed to revoke role');
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team Roles</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage role assignments and access control for your team members.</p>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-border bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-input bg-white dark:bg-background text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-card/50 border-b border-gray-200 dark:border-border">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Roles</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles?.map((roleName) => (
                        <span key={roleName} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800/50">
                          <Shield className="w-3 h-3" />
                          {roleName}
                          <button 
                            onClick={() => {
                              const roleObj = roles.find(r => r.name === roleName);
                              if (roleObj) handleRevokeRole(user.id, roleObj.id);
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      )) || <span className="text-gray-400 text-xs italic">No roles assigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-border bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Roles</h2>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {roles.map((role) => {
                const isAssigned = selectedUser.roles?.includes(role.name);
                return (
                  <div 
                    key={role.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition",
                      isAssigned ? "border-indigo-600 bg-indigo-50/30" : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isAssigned ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                      )}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{role.name}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{role.description || 'Access role'}</p>
                      </div>
                    </div>
                    {isAssigned ? (
                      <button 
                        onClick={() => handleRevokeRole(selectedUser.id, role.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Remove role"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAssignRole(selectedUser.id, role.id)}
                        className="p-1 text-green-500 hover:bg-green-50 rounded"
                        title="Assign role"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
