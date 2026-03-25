'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  MoreVertical,
  Lock,
  Users
} from 'lucide-react';
import { rbacService } from '@/services/rbac.service';

export default function SuperAdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await rbacService.getRoles();
      setRoles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">System Roles</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">RBAC Engine / Access Profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-brand/20 text-sm">
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/10 backdrop-blur-md p-4 rounded-2xl border border-border/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
          <input 
            type="text" 
            placeholder="Search roles..."
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mr-2">{filteredRoles.length} Roles Defined</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted/20 border border-border/20 animate-pulse" />
          ))
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-10" />
             <p className="text-sm text-muted-foreground uppercase tracking-widest font-black">No Roles Defined</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div key={role.id} className="group p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md hover:border-brand/30 transition-all cursor-default">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                       <Lock className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                       <h3 className="text-sm font-black tracking-tighter group-hover:text-brand transition-colors">{role.name}</h3>
                       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{role.isSystem ? 'System Managed' : 'Custom Entity'}</p>
                    </div>
                 </div>
                 {!role.isSystem && (
                   <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                   </button>
                 )}
              </div>
              
              <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-6 font-medium leading-relaxed">
                {role.description || 'Access profile governing platform-wide permissions and resource accessibility.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/10">
                 <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{role.permissions?.length || 0} Permissions</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                       <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {!role.isSystem && (
                      <button className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                         <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
