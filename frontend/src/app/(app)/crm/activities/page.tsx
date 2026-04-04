"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Zap, Phone, Mail, UserPlus, FileText, CheckCircle2, MoreVertical, Activity } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/activities");
      if (res.data?.data) {
        setActivities(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize activity stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CALL": return <Phone className="w-4 h-4" />;
      case "EMAIL": return <Mail className="w-4 h-4" />;
      case "MEETING": return <UserPlus className="w-4 h-4" />;
      case "NOTE": return <FileText className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredActivities = activities.filter((a) => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Engagement Stream Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Interaction Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor multi-channel engagement vectors and historical interaction logs</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-emerald-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400" />
            <input 
               type="text" 
               placeholder="Search engagement log..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="relative border-l border-white/[0.05] ml-6 pl-10 space-y-12">
           {filteredActivities.map((activity) => (
             <div key={activity.id} className="relative group animate-in slide-in-from-left duration-500">
                <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400 transition-all shadow-xl backdrop-blur-sm">
                   {getActivityIcon(activity.type)}
                </div>
                <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/10 transition-all relative overflow-hidden backdrop-blur-sm">
                   <div className="absolute right-8 top-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      {new Date(activity.createdAt).toLocaleString()}
                   </div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-emerald-400 transition-all">{activity.title}</h3>
                   <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">{activity.description || 'No descriptive metadata provided for this engagement vector.'}</p>
                   
                   <div className="flex items-center gap-4 mt-6">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                         Source: Internal CRM
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/5 text-emerald-400/60 text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                         {activity.type}
                      </span>
                   </div>
                </div>
             </div>
           ))}
           {filteredActivities.length === 0 && (
             <div className="py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No interaction intelligence detected in the stream.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
