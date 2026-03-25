'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Megaphone, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3,
  Calendar,
  Users,
  Search,
  Eye,
  Settings
} from 'lucide-react';
import { adminNotificationsService } from '../../../../services/admin-notifications.service';
import toast from 'react-hot-toast';

export default function SuperAdminNotificationsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await adminNotificationsService.getAnnouncements();
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to broadcast silence for this event?')) return;
    try {
      await adminNotificationsService.deleteAnnouncement(id);
      toast.success('Announcement neutralized');
      loadAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Global Broadcasts</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Platform-Wide Announcements / Emergency Banners</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-brand/20"
           >
              <Plus className="h-4 w-4" />
              Initialize Broadcast
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active List */}
        <div className="lg:col-span-2 space-y-6">
           {loading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="h-32 rounded-2xl bg-muted/10 animate-pulse border border-border/20" />
             ))
           ) : announcements.length === 0 ? (
             <div className="py-20 text-center rounded-3xl border-2 border-dashed border-border/20 bg-muted/5">
                <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40 text-muted-foreground">The platform is currently silent</p>
             </div>
           ) : (
             announcements.map((item) => (
               <div key={item.id} className="group relative rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-6 overflow-hidden transition-all hover:bg-card/30">
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    item.severity === 'CRITICAL' ? 'bg-red-500' : 
                    item.severity === 'WARNING' ? 'bg-orange-500' : 
                    item.severity === 'SUCCESS' ? 'bg-green-500' : 'bg-brand'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 
                          item.severity === 'WARNING' ? 'bg-orange-500/10 text-orange-500' : 
                          item.severity === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 'bg-brand/10 text-brand'
                        }`}>
                           {item.severity === 'CRITICAL' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                        </div>
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-widest">{item.title}</h3>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.severity} PROTOCOL</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                           <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteAnnouncement(item.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                        >
                           <Trash2 className="h-4 w-4" />
                        </button>
                     </div>
                  </div>

                  <p className="text-xs font-medium leading-relaxed mb-6 pl-11 text-muted-foreground group-hover:text-foreground transition-colors">
                     {item.content}
                  </p>

                  <div className="flex items-center gap-6 pl-11">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <Users className="h-3 w-3" />
                        Target: {item.target?.plans?.length || 'Global'}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Indefinite'}
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Settings className="h-20 w-20 rotate-45" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-brand">
                 <Search className="h-4 w-4" />
                 Broadcast Intelligence
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">Omni-Channel Sync</p>
                    <p className="text-[9px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">
                       All broadcasts are mirrored across Dashboard Banners, Email Digests, and Push Notifications by default.
                    </p>
                 </div>
                 <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-orange-500">Critical Lockdown</p>
                    <p className="text-[9px] font-medium leading-relaxed opacity-60 uppercase tracking-widest text-orange-500/80">
                       Bypasses all tenant notification filters. Use only for system-wide outages or emergency security patches.
                    </p>
                 </div>
              </div>
           </div>

           <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-xl p-8 shadow-xl text-center group">
              <Eye className="h-10 w-10 text-brand mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-black uppercase tracking-widest">Simulator Zone</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Preview how tenants experience your broadcast</p>
              <button className="mt-6 w-full py-3 bg-muted/40 hover:bg-muted rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                 Launch Preview
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
