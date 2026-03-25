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
  Settings,
  ShieldAlert,
  Zap,
  History,
  Send,
  Loader2
} from 'lucide-react';
import { adminNotificationsService } from '@/services/admin-notifications.service';
import toast from 'react-hot-toast';

type NotifTab = 'announcements' | 'broadcasts';

export default function SuperAdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotifTab>('announcements');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New entry state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('INFO');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = activeTab === 'announcements' 
        ? await adminNotificationsService.getAnnouncements()
        : await adminNotificationsService.getBroadcastHistory();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to synchronize signal history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle || !newContent) return;
    try {
      setSubmitting(true);
      if (activeTab === 'announcements') {
        await adminNotificationsService.createAnnouncement({
          title: newTitle,
          content: newContent,
          type: newType
        });
        toast.success('Announcement broadcast initiated');
      } else {
        await adminNotificationsService.sendBroadcast({
          title: newTitle,
          message: newContent,
          type: newType
        });
        toast.success('User broadcast sent');
      }
      setShowAddModal(false);
      setNewTitle('');
      setNewContent('');
      loadData();
    } catch (err) {
      toast.error('Failed to commit signal');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Neutralize this signal transmission?')) return;
    try {
      if (activeTab === 'announcements') {
        await adminNotificationsService.deleteAnnouncement(id);
        toast.success('Announcement neutralized');
      }
      loadData();
    } catch (err) {
      toast.error('Failed to clear signal');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Global Signal Orchestration</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Platform Communications / Omni-Channel Broadcasts</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-brand/20 active:scale-[0.98]"
           >
              <Plus className="h-4 w-4" />
              Initialize Signal
           </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/20 border border-border/30 rounded-2xl w-fit backdrop-blur-md">
         {(['announcements', 'broadcasts'] as NotifTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab 
                ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                : 'text-muted-foreground hover:text-foreground'
              }`}
            >
               {tab === 'announcements' ? <Megaphone className="h-4 w-4" /> : <Send className="h-4 w-4" />}
               {tab}
            </button>
         ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active List */}
        <div className="lg:col-span-2 space-y-6">
           {loading ? (
             [...Array(4)].map((_, i) => (
               <div key={i} className="h-32 rounded-3xl bg-muted/10 animate-pulse border border-border/20" />
             ))
           ) : items.length === 0 ? (
             <div className="py-24 text-center rounded-3xl border-2 border-dashed border-border/20 bg-muted/5">
                <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-6">
                   <AlertTriangle className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest opacity-40 text-muted-foreground">The platform signal band is currently dormant</p>
             </div>
           ) : (
             items.map((item) => (
               <div key={item.id} className="group relative rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-8 overflow-hidden transition-all hover:bg-card/20 hover:border-border/50">
                  <div className={`absolute top-0 left-0 bottom-0 w-2 ${
                    item.type === 'CRITICAL' || item.severity === 'CRITICAL' ? 'bg-red-500' : 
                    item.type === 'WARNING' || item.severity === 'WARNING' ? 'bg-orange-500' : 
                    'bg-brand'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          item.type === 'CRITICAL' || item.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-brand/10 text-brand'
                        }`}>
                           <Info className="h-5 w-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-widest tracking-tighter">{item.title}</h3>
                           <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                              {activeTab === 'announcements' ? 'PLATFORM BANNER' : 'USER BROADCAST'} • {item.type || item.severity || 'INFO'}
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {activeTab === 'announcements' && (
                           <button 
                             onClick={() => deleteItem(item.id)}
                             className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-muted-foreground hover:text-red-500 hover:scale-105 active:scale-95"
                           >
                              <Trash2 className="h-4 w-4" />
                           </button>
                        )}
                     </div>
                  </div>

                  <p className="text-xs font-medium leading-relaxed mb-8 pl-14 text-muted-foreground group-hover:text-foreground transition-colors max-w-2xl">
                     {item.content || item.message}
                  </p>

                  <div className="flex items-center gap-8 pl-14">
                     <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/10">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                     </div>
                     {item.expiresAt && (
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-500/60 bg-orange-500/5 px-3 py-1.5 rounded-lg border border-orange-500/10">
                           <Clock className="h-3 w-3" />
                           Expiry: {new Date(item.expiresAt).toLocaleDateString()}
                        </div>
                     )}
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
           <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                 <Zap className="h-32 w-32" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 text-brand relative z-10">
                 <ShieldAlert className="h-5 w-5" />
                 Signal Protocol
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="p-5 rounded-2xl bg-muted/20 border border-border/10">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">Announcement Layer</p>
                    <p className="text-[9px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">
                       Banners appearing across all tenant dashboards. Persistent until expiration or manual neutralization.
                    </p>
                 </div>
                 <div className="p-5 rounded-2xl bg-brand/5 border border-brand/10">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-brand">Broadcast Layer</p>
                    <p className="text-[9px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">
                       Direct in-app notifications sent to individual user seats. Mirrored to push endpoints.
                    </p>
                 </div>
              </div>
           </div>

           <div className="rounded-3xl border border-border/30 bg-card/5 backdrop-blur-xl p-10 text-center group border-t-4 border-t-emerald-500">
              <History className="h-12 w-12 text-emerald-500 mx-auto mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="text-xs font-black uppercase tracking-widest">Signal Integrity</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-3 leading-relaxed">
                 All platform-wide transmissions are logged in the immutable audit trail for forensic synchronization.
              </p>
           </div>
        </div>
      </div>

      {/* Initialize Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-black/60">
            <div className="bg-card w-full max-w-xl rounded-3xl border border-border/30 shadow-2xl p-10 space-y-8 animate-modal-in">
               <div className="flex items-center justify-between">
                  <div>
                     <h2 className="text-xl font-black uppercase tracking-tighter">Initialize Signal</h2>
                     <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                        Preparing {activeTab === 'announcements' ? 'Global Banner' : 'User Broadcast'} Transmission
                     </p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                     <Plus className="h-6 w-6 rotate-45" />
                  </button>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Signal Header</label>
                     <input 
                        className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-sm focus:border-brand/40 outline-none"
                        placeholder="Crisis Mitigation / Platform Update..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Signal Payload</label>
                     <textarea 
                        className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-xs focus:border-brand/40 outline-none h-32 leading-relaxed"
                        placeholder="Detail the signal content here..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Severity Protocol</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['INFO', 'WARNING', 'CRITICAL'].map((t) => (
                           <button 
                              key={t}
                              onClick={() => setNewType(t)}
                              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                 newType === t ? 'bg-brand border-brand text-white' : 'bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40'
                              }`}
                           >
                              {t}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleCreate}
                  disabled={submitting || !newTitle || !newContent}
                  className="w-full py-5 bg-brand text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
               >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Finalize & Transmit
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
