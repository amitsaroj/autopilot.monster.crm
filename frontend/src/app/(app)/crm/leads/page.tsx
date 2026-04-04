"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Target, Filter, Rocket } from "lucide-react";
import LeadConversionModal from "@/components/crm/LeadConversionModal";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source?: string;
  status: string;
  score?: number;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "Manual",
    status: "NEW",
  });
  const [conversionLead, setConversionLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/leads");
      if (res.data?.data) {
        setLeads(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize lead vectors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/leads/${editingId}`, formData);
        toast.success("Lead vector reconfigured");
      } else {
        await api.post("/crm/leads", formData);
        toast.success("Lead vector initialized");
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Vector initialization failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm dissolution of lead vector?")) return;
    try {
      await api.delete(`/crm/leads/${id}`);
      toast.success("Lead vector dissolved");
      fetchLeads();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Dissolution failed");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ 
      firstName: "", 
      lastName: "", 
      email: "", 
      phone: "", 
      source: "Manual", 
      status: "NEW" 
    });
    setIsModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setFormData({
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "Manual",
      status: lead.status || "NEW",
    });
    setIsModalOpen(true);
  };

  const filteredLeads = leads.filter((l) => 
    (l.firstName + " " + l.lastName).toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                 Acquisition Engine Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight text-sans">Lead Intelligence</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Monitor incoming vectors and acquisition sources</p>
        </div>
        <button onClick={openCreate} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 group">
           <Plus className="w-4 h-4" /> Initialize Lead Vector
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-emerald-500/30 transition-all shadow-inner">
               <Search className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400" />
               <input 
                  type="text" 
                  placeholder="Search vector email or identity artifact..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
               />
            </div>
         </div>
         <button className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-widest transition-all">
            <Filter className="w-4 h-4" /> Filter Stack
         </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Vector Identity</th>
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Source Artifact</th>
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Current Phase</th>
                  <th className="p-6 text-[10px] font-black tracking-widest uppercase text-gray-500">Capture Date</th>
                  <th className="p-6 text-right text-[10px] font-black tracking-widest uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg uppercase shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {lead.firstName?.[0] || 'L'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{lead.firstName} {lead.lastName}</p>
                          <p className="text-[10px] font-bold text-gray-500">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        {lead.source}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        lead.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-2">
                       <button 
                         onClick={() => setConversionLead(lead)}
                         className="p-2.5 rounded-xl text-emerald-500 hover:text-white hover:bg-emerald-500 transition-all opacity-0 group-hover:opacity-100"
                         title="Convert to Contact"
                       >
                          <Rocket className="w-4 h-4" />
                       </button>
                       <button onClick={() => openEdit(lead)} className="p-2.5 rounded-xl text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                          <Edit2 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(lead.id)} className="p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center text-gray-500 font-black text-xs uppercase tracking-widest">
                       No lead vectors detected currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Target className="w-6 h-6 text-emerald-500" /> {editingId ? "Reconfigure Vector" : "Initialize Vector"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Given Designation</label>
                   <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Surname Designation</label>
                   <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40" />
                 </div>
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Network Vector (Email)</label>
                   <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40" />
                 </div>
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comm Channel (Phone)</label>
                   <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 tracking-widest" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Acquisition Source</label>
                   <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 appearance-none cursor-pointer">
                      <option value="Manual" className="bg-[#0b0f19]">Manual Pulse</option>
                      <option value="Webform" className="bg-[#0b0f19]">Inbound Webform</option>
                      <option value="API" className="bg-[#0b0f19]">Nexus API</option>
                      <option value="Referral" className="bg-[#0b0f19]">Network Referral</option>
                   </select>
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Lifecycle Phase</label>
                   <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/40 appearance-none cursor-pointer">
                      <option value="NEW" className="bg-[#0b0f19]">New Vector</option>
                      <option value="QUALIFIED" className="bg-[#0b0f19]">Qualified Sequence</option>
                      <option value="LOST" className="bg-[#0b0f19]">Fragmented</option>
                   </select>
                 </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/[0.02] border-white/5 border hover:bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20">Execute Provisioning</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lead Conversion Modal */}
      <LeadConversionModal 
        isOpen={!!conversionLead}
        lead={conversionLead}
        onClose={() => setConversionLead(null)}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
