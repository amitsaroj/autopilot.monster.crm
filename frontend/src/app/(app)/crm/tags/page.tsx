"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Tag as TagIcon, Hash, Palette } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Tag {
  id: string;
  name: string;
  color: string;
  type: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366f1",
    type: "GENERIC",
  });

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/tags");
      if (res.data?.data) {
        setTags(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize taxonomy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/crm/tags", formData);
      toast.success("Taxonomy node initialized");
      setIsModalOpen(false);
      fetchTags();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Configuration failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm dissolution of taxonomy node?")) return;
    try {
      await api.delete(`/crm/tags/${id}`);
      toast.success("Node dissolved");
      fetchTags();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Dissolution failed");
    }
  };

  const colors = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", 
    "#a855f7", "#ec4899", "#06b6d4", "#8b5cf6", "#f43f5e"
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Taxonomy Layer Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Tag Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage entity classification nodes and visual markers</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Node
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {tags.map((tag) => (
             <div key={tag.id} className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group relative overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                   <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${tag.color}10`, border: `1px solid ${tag.color}30`, color: tag.color }}>
                      <TagIcon className="w-5 h-5" />
                   </div>
                   <button onClick={() => handleDelete(tag.id)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{tag.name}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Identity: {tag.id.slice(0,8)}</span>
                   <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 uppercase tracking-tighter">{tag.type}</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: tag.color }} />
             </div>
           ))}
           {tags.length === 0 && (
             <div className="col-span-full py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No taxonomy nodes detected.</p>
             </div>
           )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <TagIcon className="w-6 h-6 text-indigo-500" /> Initialize Node
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Node Designation</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                   <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 uppercase tracking-widest" placeholder="e.g. VIP-CLIENT" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Chromatic Marker</label>
                <div className="flex flex-wrap gap-3">
                   {colors.map((c) => (
                     <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-10 h-10 rounded-xl transition-all border-2 ${formData.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Logical Scope</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 appearance-none cursor-pointer">
                   <option value="GENERIC" className="bg-[#0b0f19]">Omni-Dimensional (Generic)</option>
                   <option value="LEAD" className="bg-[#0b0f19]">Acquisition Vector (Lead)</option>
                   <option value="CONTACT" className="bg-[#0b0f19]">Human Entity (Contact)</option>
                   <option value="DEAL" className="bg-[#0b0f19]">Revenue Pipeline (Deal)</option>
                </select>
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
