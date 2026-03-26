'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  Plus, 
  Filter,
  UserPlus,
  Mail,
  Building2,
  Lock
} from 'lucide-react';
import { adminUsersService } from '@/services/admin-users.service';

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUsersService.findAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter text-foreground">Global Registry</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SuperAdmin / Platform Personnel Control</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <UserPlus className="h-4 w-4" />
            Provision Operator
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search by identity, mail, or UUID..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2.5 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border/50 transition-colors">
              <Filter className="h-4 w-4 text-muted-foreground" />
           </button>
           <div className="h-6 w-px bg-border/40 mx-1" />
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">Displaying {filteredUsers.length} Entities</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full border-collapse text-foreground">
          <thead>
            <tr className="border-b border-border/20 text-left bg-muted/10">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Personnel Identity</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Affiliation</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Authorization</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 font-bold">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                   <td colSpan={4} className="px-6 py-4 h-16 bg-muted/5" />
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                   <Users className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Entities Detected</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-all text-brand font-black text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0] || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <Mail className="h-2 w-2" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">{user.tenantId || 'GLOBAL_ROOT'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-brand/60" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-brand">{user.role || 'OPERATOR'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-brand/10 hover:text-brand transition-all border border-transparent hover:border-brand/20">
                         <Lock className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
