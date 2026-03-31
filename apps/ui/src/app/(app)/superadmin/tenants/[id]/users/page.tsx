'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  Zap, 
  Settings, 
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Info,
  Building2,
  Users,
  Search,
  MoreVertical,
  Key,
  ChevronRight
} from 'lucide-react';
import { adminUsersService } from '@/services/admin-users.service';
import { adminUserOverrideService } from '@/services/admin-user-override.service';
import toast from 'react-hot-toast';

export default function TenantUsersManagementPage() {
  const { id } = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [overrides, setOverrides] = useState<any>({ features: {}, limits: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (id) loadUsers();
  }, [id]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUsersService.findAll({ tenantId: id as string });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to intercept tenant users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserOverrides = async (user: any) => {
    try {
      setSelectedUser(user);
      const res = await adminUserOverrideService.getOverrides(user.id);
      setOverrides(res.data || { features: {}, limits: {} });
    } catch (err) {
      console.error(err);
      toast.error('Forensic override retrieval failed');
    }
  };

  const handleSaveOverrides = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await adminUserOverrideService.updateOverrides(selectedUser.id, overrides);
      toast.success(`User overrides synchronized for ${selectedUser.email}`);
    } catch (err) {
      console.error(err);
      toast.error('Orchestration failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div className="flex items-center gap-4">
           <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-muted/50 border border-border/30 transition-all group"
           >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <h1 className="page-title font-black text-3xl tracking-tighter text-brand">User Specific Orchestration</h1>
              <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Tenant Authority: {id}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-brand/10 border border-brand/20 rounded-xl flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">L7 Authority Level</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: User List */}
        <div className="lg:col-span-4 space-y-6">
           <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-border/10 bg-muted/5">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-brand transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search identities..."
                      className="w-full pl-9 pr-4 py-2 bg-muted/30 border border-transparent focus:border-brand/40 focus:bg-background/80 rounded-xl transition-all outline-none text-[10px] font-black uppercase tracking-widest"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto divide-y divide-border/10">
                 {loading ? (
                    [...Array(5)].map((_, i) => (
                       <div key={i} className="p-6 animate-pulse bg-muted/5 h-20" />
                    ))
                 ) : users.length === 0 ? (
                    <div className="p-10 text-center opacity-40 text-[10px] font-black uppercase tracking-widest">No identities detected</div>
                 ) : (
                    users.filter(u => u.email.includes(search) || u.name?.includes(search)).map((user) => (
                       <div 
                         key={user.id}
                         onClick={() => loadUserOverrides(user)}
                         className={`p-6 cursor-pointer transition-all hover:bg-muted/5 flex items-center justify-between group ${
                           selectedUser?.id === user.id ? 'bg-brand/10 border-r-4 border-r-brand' : ''
                         }`}
                       >
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-xl transition-colors ${selectedUser?.id === user.id ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-muted/30 text-muted-foreground'}`}>
                                <User className="h-4 w-4" />
                             </div>
                             <div>
                                <p className="text-xs font-black tracking-tighter truncate max-w-[150px]">{user.name || 'Anonymous'}</p>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest truncate max-w-[150px]">{user.email}</p>
                             </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-all ${selectedUser?.id === user.id ? 'translate-x-1 text-brand' : 'opacity-0 group-hover:opacity-100'}`} />
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Right: Overrides Management */}
        <div className="lg:col-span-8 space-y-8">
           {selectedUser ? (
              <div className="space-y-8 animate-slide-up">
                 {/* Identity Summary */}
                 <div className="p-8 rounded-3xl bg-brand border border-brand/30 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                       <ShieldCheck className="h-32 w-32 text-white" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                       <div className="text-white">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Subject Under Observation</p>
                          <h2 className="text-2xl font-black tracking-tighter">{selectedUser.name}</h2>
                          <p className="text-xs font-bold opacity-80">{selectedUser.email}</p>
                       </div>
                       <button 
                         onClick={handleSaveOverrides}
                         disabled={saving}
                         className="px-8 py-3 bg-white text-brand rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                       >
                          <Save className="h-4 w-4" />
                          {saving ? 'Synchronizing...' : 'Apply Overrides'}
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Feature Toggles */}
                    <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-t-8 border-t-brand">
                       <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                          <Zap className="h-6 w-6 text-brand" />
                          Beta Privilege Escalation
                       </h3>
                       <div className="space-y-4">
                          {[
                            { label: 'Neural Core Access', key: 'neural_access' },
                            { label: 'Forensic Analytics', key: 'forensic_view' },
                            { label: 'Admin Command L3', key: 'admin_l3' },
                            { label: 'Beta Feature Ingress', key: 'beta_access' },
                          ].map((feat) => (
                             <div key={feat.key} className="flex items-center justify-between p-5 rounded-2xl bg-muted/10 border border-border/10">
                                <div>
                                   <p className="text-[10px] font-black uppercase tracking-tight">{feat.label}</p>
                                   <p className="text-[8px] text-muted-foreground font-bold uppercase mt-0.5">User-specific override</p>
                                </div>
                                <button 
                                   onClick={() => {
                                      const newFeatures = { ...overrides.features, [feat.key]: !overrides.features?.[feat.key] };
                                      setOverrides({ ...overrides, features: newFeatures });
                                   }}
                                   className={`w-12 h-6 rounded-full transition-all relative ${overrides.features?.[feat.key] ? 'bg-brand shadow-lg shadow-brand/20' : 'bg-muted'}`}
                                >
                                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${overrides.features?.[feat.key] ? 'right-1' : 'left-1'}`} />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Limit Overrides */}
                    <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-t-8 border-t-blue-500">
                       <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4 text-blue-500">
                          <ShieldCheck className="h-6 w-6" />
                          Resource Allocation
                       </h3>
                       <div className="space-y-6">
                          {[
                            { label: 'API Burst Capacity', key: 'api_burst' },
                            { label: 'Max Active Workflows', key: 'max_workflows' },
                            { label: 'Storage Quota (MB)', key: 'storage_mb' },
                          ].map((limit) => (
                             <div key={limit.key} className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{limit.label}</label>
                                <input 
                                   type="number" 
                                   className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none transition-all tabular-nums"
                                   placeholder="Global Default"
                                   value={overrides.limits?.[limit.key] || ''}
                                   onChange={(e) => {
                                      const newLimits = { ...overrides.limits, [limit.key]: parseInt(e.target.value) || undefined };
                                      setOverrides({ ...overrides, limits: newLimits });
                                   }}
                                />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Information Box */}
                 <div className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 flex gap-6 items-start">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                       <Key className="h-6 w-6" />
                    </div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-2 text-left">Authority Note</h4>
                       <p className="text-xs text-muted-foreground font-medium leading-relaxed text-left">
                          User-level overrides are evaluated after Tenant-level overrides. These settings grant specific capabilities to individual team members without escalating entire tenant privileges.
                       </p>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-[600px] flex flex-col items-center justify-center border border-dashed border-border/30 rounded-3xl opacity-30">
                 <Users className="h-16 w-16 mb-6" />
                 <p className="text-xs font-black uppercase tracking-widest">Select an identity for orchestration</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
