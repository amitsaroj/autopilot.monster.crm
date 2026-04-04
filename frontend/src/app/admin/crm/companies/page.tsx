"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, Building2, User, Mail, Phone, ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export default function AdministrativeCompanyIntelligencePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    phone: "",
    address: "",
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/crm/companies");
      if (res.data?.data) {
        setCompanies(res.data.data);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize company artifacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/companies/${editingId}`, formData);
        toast.success("Corporate lattice updated");
      } else {
        await api.post("/crm/companies", formData);
        toast.success("Corporate lattice provisioned");
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Artifact generation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you wish to dissolve this corporate node?")) return;
    try {
      await api.delete(`/crm/companies/${id}`);
      toast.success("Corporate lattice dissolved");
      fetchCompanies();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Dissolution failed");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: "", website: "", industry: "", phone: "", address: "" });
    setIsModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name || "",
      website: company.website || "",
      industry: company.industry || "",
      phone: company.phone || "",
      address: company.address || "",
    });
    setIsModalOpen(true);
  };

  const filteredCompanies = companies.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                 Market Lattices Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Corporate Architecture</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage B2B identities, industries, and organizational clusters</p>
        </div>
        <button onClick={openCreate} className="px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Provision Corporate Node
        </button>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-blue-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-blue-400" />
            <input 
               type="text" 
               placeholder="Search by nexus identity or industry block..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 font-medium"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredCompanies.map((company) => (
             <div key={company.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all group relative">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/0 rounded-full blur-2xl group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-[#0b0f19] border border-white/5 flex items-center justify-center text-gray-400 shadow-inner group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all">
                      <Building2 className="w-6 h-6" />
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => openEdit(company)} className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                         <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(company.id)} className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none mb-1">{company.name}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">{company.industry || "Undefined Vector"}</p>

                <div className="space-y-3 pt-4 border-t border-white/5">
                   {company.website && (
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-blue-400 transition-all group/link cursor-pointer">
                         <span className="flex items-center gap-3"><Globe className="w-3.5 h-3.5 opacity-40" /> {company.website}</span>
                         <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                   )}
                   {company.phone && (
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                         <Phone className="w-3.5 h-3.5 opacity-40" /> {company.phone}
                      </div>
                   )}
                </div>
             </div>
           ))}
           {filteredCompanies.length === 0 && (
             <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No structural lattices detected in sector.</p>
             </div>
           )}
        </div>
      )}

      {/* Corporate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-500" /> {editingId ? "Reconfigure Node" : "Initialize Node"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Lattice Designation</label>
                   <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500/40" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Industry Vector</label>
                   <input type="text" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500/40" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Network Subdomain</label>
                   <input type="text" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500/40 pt-placeholder-font-sans" placeholder="www.acme.com" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comm Channel</label>
                   <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500/40 tracking-widest" />
                 </div>
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Geography Coordinates</label>
                   <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-500/40" />
                 </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/[0.02] border-white/5 border hover:bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20">Commit Pulse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
