"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, FileText, DollarSign, Clock, CheckCircle2, ChevronRight, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Quote {
  id: string;
  number: string;
  total: number;
  currency: string;
  status: string;
  validUntil?: string;
  contact?: { firstName: string; lastName: string };
  company?: { name: string };
  createdAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    number: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
    total: 0,
    currency: "USD",
    status: "DRAFT",
    validUntil: "",
  });

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/quotes");
      if (res.data?.data) {
        setQuotes(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize financial artifacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/quotes/${editingId}`, formData);
        toast.success("Financial artifact mutated");
      } else {
        await api.post("/crm/quotes", formData);
        toast.success("Financial artifact initialized");
      }
      setIsModalOpen(false);
      fetchQuotes();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Configuration failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm dissolution of financial artifact?")) return;
    try {
      await api.delete(`/crm/quotes/${id}`);
      toast.success("Artifact dissolved");
      fetchQuotes();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Dissolution failed");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ 
      number: `QT-${Math.floor(1000 + Math.random() * 9000)}`, 
      total: 0, 
      currency: "USD", 
      status: "DRAFT",
      validUntil: "" 
    });
    setIsModalOpen(true);
  };

  const filteredQuotes = quotes.filter((q) => 
    q.number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Financial Orchestration Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Quote Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage financial artifacts, revenue proposals & approval cycles</p>
        </div>
        <button onClick={openCreate} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Artifact
        </button>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search financial artifact number..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto text-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Artifact Identity</th>
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Stakeholder Lattice</th>
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Approval Phase</th>
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Revenue Vector</th>
                  <th className="p-6 text-right text-[10px] font-black tracking-widest uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs uppercase shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          QT
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{quote.number}</p>
                          <p className="text-[10px] font-bold text-gray-500">ID: {quote.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                             <User className="w-3.5 h-3.5 text-gray-500" /> {quote.contact ? `${quote.contact.firstName} ${quote.contact.lastName}` : 'Standalone'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                             <Building2 className="w-3.5 h-3.5 text-gray-600" /> {quote.company?.name || 'No Lattice'}
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        quote.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        quote.status === 'DRAFT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-black text-white tracking-widest">${quote.total.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-indigo-500/60 uppercase">{quote.currency}</div>
                    </td>
                    <td className="p-6 text-right space-x-2">
                       <button onClick={() => handleDelete(quote.id)} className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 rounded-xl text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                          <ChevronRight className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-500 font-black text-xs uppercase tracking-widest">
                       No financial artifacts detected currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Artifact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-indigo-500" /> {editingId ? "Reconfigure Artifact" : "Initialize Artifact"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Serial Identity</label>
                   <input required type="text" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 tracking-widest" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Revenue Target (Total)</label>
                   <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <input required type="number" value={formData.total} onChange={(e) => setFormData({...formData, total: Number(e.target.value)})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40" />
                   </div>
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Lifecycle phase</label>
                   <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 appearance-none cursor-pointer">
                      <option value="DRAFT" className="bg-[#0b0f19]">Incipient (Draft)</option>
                      <option value="SENT" className="bg-[#0b0f19]">Transmitted (Sent)</option>
                      <option value="ACCEPTED" className="bg-[#0b0f19]">Materialized (Accepted)</option>
                      <option value="DECLINED" className="bg-[#0b0f19]">Rescinded (Declined)</option>
                   </select>
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expiration Vector</label>
                   <input type="date" value={formData.validUntil} onChange={(e) => setFormData({...formData, validUntil: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40" />
                 </div>
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
