'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronRight, 
  Globe, 
  Activity, 
  Users, 
  Settings, 
  CreditCard, 
  Plus,
  Search,
  MoreVertical,
  ShieldCheck,
  Mail,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { adminTenantsService } from '@/services/admin-tenants.service';
import { adminUsersService } from '@/services/admin-users.service';

export default function SuperAdminTenantDetailsPage({ params }: { params: { id: string } }) {
  const [tenant, setTenant] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantRes, usersRes] = await Promise.all([
        adminTenantsService.findOne(params.id),
        adminUsersService.findAll() // For now just finding all and filtering
      ]);
      setTenant(tenantRes.data);
      setUsers(usersRes.data.filter((u: any) => u.tenantId === params.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-foreground">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
         <Globe className="h-3 w-3" />
         <span>Registry</span>
         <ChevronRight className="h-3 w-3" />
         <span className="text-foreground">{tenant?.name || 'Loading Entity...'}</span>
      </div>

      {/* Header */}
      <div className="page-header border-b border-border/10 pb-8">
        <div>
          <h1 className="page-title font-black text-4xl tracking-tighter">{tenant?.name}</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[11px] mt-1">Tenant ID: {tenant?.id}</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl hover:opacity-90 transition-all font-black shadow-2xl shadow-brand/30 text-[10px] uppercase tracking-widest">
            <Lock className="h-4 w-4" />
            Suspend Entity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Main Details */}
         <div className="lg:col-span-8 space-y-10">
            {/* User List */}
            <div className="rounded-[2.5rem] border border-border/30 bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
               <div className="px-10 py-8 border-b border-border/10 flex items-center justify-between bg-muted/10">
                  <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                     <Users className="h-5 w-5 text-brand" />
                     Associated Personnel
                  </h2>
                  <button className="p-2 rounded-xl hover:bg-brand/10 text-brand transition-all border border-transparent hover:border-brand/20">
                     <Plus className="h-4 w-4" />
                  </button>
               </div>
               <table className="w-full border-collapse">
                  <tbody className="divide-y divide-border/10 font-bold">
                     {users.length === 0 ? (
                        <tr>
                           <td className="px-10 py-20 text-center text-muted-foreground uppercase tracking-widest font-black text-[10px]">No personnel detected in this vector</td>
                        </tr>
                     ) : (
                        users.map((user) => (
                           <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                              <td className="px-10 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xs">
                                       {user.firstName?.[0]}{user.lastName?.[0]}
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
                              <td className="px-10 py-6 text-right">
                                 <span className="px-3 py-1 bg-brand/10 text-brand border border-brand/20 rounded-lg text-[9px] font-black uppercase tracking-widest">{user.role}</span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-brand">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-brand" />
                  Billing Context
               </h3>
               <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-muted/10 border border-border/10">
                     <p className="text-[8px] font-black text-muted-foreground/40 uppercase mb-1">Active Plan</p>
                     <p className="text-sm font-black text-foreground uppercase tracking-widest">{tenant?.planId || 'ENTERPRISE-L7'}</p>
                  </div>
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-brand/10 border border-brand/20">
                     <span className="text-[10px] font-black uppercase tracking-widest text-brand">Next Disbursement</span>
                     <span className="text-xs font-black text-brand tracking-tighter">$1,482.00</span>
                  </div>
               </div>
            </div>

            <div className="bg-card/20 backdrop-blur-xl rounded-[3rem] border border-border/30 p-10 shadow-xl border-t-8 border-t-purple-500">
               <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Telemetry
               </h3>
               <div className="space-y-4 text-foreground">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-muted-foreground/60">Concurrent Sessions</span>
                     <span>42</span>
                  </div>
                  <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 rounded-full w-[42%]" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-2">
                     <span className="text-muted-foreground/60">Storage Manifest</span>
                     <span>84%</span>
                  </div>
                  <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 rounded-full w-[84%]" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
