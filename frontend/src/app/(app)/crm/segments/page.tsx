"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Users, Target, Filter, ChevronRight, Zap, Database } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Segment {
  id: string;
  name: string;
  description?: string;
  rules: any;
  entityType: string;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    entityType: "LEAD",
    rules: { operator: "AND", conditions: [] },
  });

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/segments");
      if (res.data?.data) {
        setSegments(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize audience clusters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/crm/segments", formData);
      toast.success("Audience cluster initialized");
      setIsModalOpen(false);
      fetchSegments();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Configuration failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm dissolution of audience cluster?")) return;
    try {
      await api.delete(`/crm/segments/${id}`);
      toast.success("Cluster dissolved");
      fetchSegments();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Dissolution failed");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                 Audience Orchestration Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Segment Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage dynamic audience clusters and logical entity groupings</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Cluster
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {segments.map((segment) => (
             <div key={segment.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-violet-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-violet-500/5 transition-colors pointer-events-none" />
                
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-400 transition-all shadow-2xl">
                         <Target className="w-6 h-6" />
                      </div>
                      <button onClick={() => handleDelete(segment.id)} className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <h3 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight mb-2 leading-none uppercase tracking-tight mb-2">{segment.name}</h3>
                   <div className="flex items-center gap-2 mb-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[9px] font-black uppercase tracking-widest border border-violet-500/20">
                        {segment.entityType} SEGMENT
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] text-gray-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                        Dynamic Update
                      </span>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                         <Zap className="w-4 h-4 text-amber-500 opacity-40 shrink-0" /> {segment.description || 'No descriptive logic assigned.'}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white/[0.02] p-3 rounded-xl border border-white/5">
                         <Filter className="w-4 h-4 opacity-40 shrink-0" /> {segment.rules?.conditions?.length || 0} Rule Conditions
                      </div>
                   </div>
                </div>
             </div>
           ))}
           {segments.length === 0 && (
             <div className="col-span-full py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No audience clusters detected.</p>
             </div>
           )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Users className="w-6 h-6 text-violet-500" /> Initialize Cluster
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cluster Label</label>
                   <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-violet-500/40" placeholder="e.g. High Value Leads" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Audience Lattice</label>
                   <select value={formData.entityType} onChange={(e) => setFormData({...formData, entityType: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-violet-500/40 appearance-none cursor-pointer">
                      <option value="LEAD" className="bg-[#0b0f19]">Acquisition Vector (Lead)</option>
                      <option value="CONTACT" className="bg-[#0b0f19]">Human Entity (Contact)</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Logical Scope Description</label>
                   <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-violet-500/40 min-h-[100px] resize-none" placeholder="Targeting contacts with high revenue potential..." />
                 </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/[0.02] border-white/5 border hover:bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/20">Execute Clustering</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
