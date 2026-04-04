"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, FileText, StickyNote, Clock, Bookmark, MoreVertical, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isPinned: false,
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/notes");
      if (res.data?.data) {
        setNotes(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize knowledge artifacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/crm/notes", formData);
      toast.success("Knowledge artifact initialized");
      setIsModalOpen(false);
      fetchNotes();
    } catch (e: any) {
      toast.error("Configuration failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm dissolution of knowledge artifact?")) return;
    try {
      await api.delete(`/crm/notes/${id}`);
      toast.success("Artifact dissolved from knowledge base");
      fetchNotes();
    } catch (e: any) {
      toast.error("Dissolution failed");
    }
  };

  const filteredNotes = notes.filter((n) => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                 Knowledge Fabric Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Knowledge Orchestrator</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage persistent knowledge artifacts and contextual intelligence</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Artifact
        </button>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-amber-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-amber-400" />
            <input 
               type="text" 
               placeholder="Search knowledge artifact..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredNotes.map((note) => (
             <div key={note.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/20 transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-amber-500/5 transition-colors pointer-events-none" />
                
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-400 transition-all shadow-2xl relative">
                         <StickyNote className="w-6 h-6" />
                         {note.isPinned && <Bookmark className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 fill-amber-400" />}
                      </div>
                      <button onClick={() => handleDelete(note.id)} className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight mb-4 leading-none">{note.title || 'Incipient Artifact'}</h3>
                   <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-4">{note.content}</p>
                </div>

                <div className="pt-6 mt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> {new Date(note.createdAt).toLocaleDateString()}
                   </div>
                   <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">ID: {note.id.slice(0,8)}</span>
                </div>
             </div>
           ))}
           {filteredNotes.length === 0 && (
             <div className="col-span-full py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No knowledge artifacts detected in the fabric.</p>
             </div>
           )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-500" /> Initialize Artifact
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Artifact Designation</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-amber-500/40" placeholder="e.g. Strategic Follow-up Context" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Knowledge Content</label>
                 <textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-amber-500/40 min-h-[200px] resize-none" placeholder="Enter persistent intelligence..." />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                 <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={(e) => setFormData({...formData, isPinned: e.target.checked})} className="w-4 h-4 rounded bg-white/5 border-white/10 text-amber-500 focus:ring-0 cursor-pointer" />
                 <label htmlFor="isPinned" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">Pin to Knowledge Fabric</label>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/[0.02] border-white/5 border hover:bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20">Execute Provisioning</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
