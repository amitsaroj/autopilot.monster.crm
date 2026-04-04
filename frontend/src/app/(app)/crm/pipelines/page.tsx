"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Layout, Settings2, GitMerge } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface PipelineStage {
  id: string;
  name: string;
  order: number;
}

interface Pipeline {
  id: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStage[];
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    isDefault: false,
  });

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/pipelines");
      if (res.data?.data) {
        setPipelines(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize logic flows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/pipelines/${editingId}`, formData);
        toast.success("Logic flow reconfigured");
      } else {
        await api.post("/crm/pipelines", formData);
        toast.success("Logic flow initialized");
      }
      setIsModalOpen(false);
      fetchPipelines();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Configuration failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm dissolution of logic flow?")) return;
    try {
      await api.delete(`/crm/pipelines/${id}`);
      toast.success("Logic dissolved");
      fetchPipelines();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Dissolution failed");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: "", isDefault: false });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Logic Orchestration Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Pipeline Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Configure acquisition stages and conversion logic flows</p>
        </div>
        <button onClick={openCreate} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Logic Flow
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {pipelines.map((pipeline) => (
             <div key={pipeline.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors pointer-events-none" />
                
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 transition-all shadow-2xl">
                         <GitMerge className="w-6 h-6" />
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                            <Settings2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(pipeline.id)} className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mb-2 leading-none">
                      {pipeline.name}
                   </h3>
                   <div className="flex items-center gap-2 mb-6">
                      {pipeline.isDefault && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                          Primary Path
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] text-gray-500 text-[9px] font-black uppercase tracking-widest border border-white/5">
                        {pipeline.stages?.length || 0} Phases
                      </span>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-white/5">
                      {pipeline.stages?.sort((a,b) => a.order - b.order).map((stage, idx) => (
                        <div key={stage.id} className="flex items-center gap-3 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                           <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[8px] text-gray-500 border border-white/5">{idx + 1}</span>
                           {stage.name}
                        </div>
                      ))}
                      {(!pipeline.stages || pipeline.stages.length === 0) && (
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic">No logic segments defined</p>
                      )}
                   </div>
                </div>
             </div>
           ))}
           {pipelines.length === 0 && (
             <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No logic flows detected.</p>
             </div>
           )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-indigo-500" /> {editingId ? "Reconfigure Flow" : "Initialize Flow"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Logic Label</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40" placeholder="e.g. Enterprise Sales Pipeline" />
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                 <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4 rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-0 cursor-pointer" />
                 <label htmlFor="isDefault" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">Set as Primary Path</label>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/[0.02] border-white/5 border hover:bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">Execute Provisioning</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
