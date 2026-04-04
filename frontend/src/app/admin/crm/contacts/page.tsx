"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Loader2, User, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

interface Company {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  company?: Company;
  status: string;
  createdAt: string;
}

export default function AdministrativeContactIntelligencePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactRes, companyRes] = await Promise.all([
        api.get("/crm/contacts"),
        api.get("/crm/companies"),
      ]);
      if (contactRes.data?.data) setContacts(contactRes.data.data);
      if (companyRes.data?.data) setCompanies(companyRes.data.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to synchronize node data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/crm/contacts/${editingId}`, formData);
        toast.success("Identity node mutated");
      } else {
        await api.post("/crm/contacts", formData);
        toast.success("Identity node injected");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Node injection failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm erasure of identity node?")) return;
    try {
      await api.delete(`/crm/contacts/${id}`);
      toast.success("Identity erased");
      fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erasure failed");
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ firstName: "", lastName: "", email: "", phone: "", companyId: "" });
    setIsModalOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || "",
      companyId: contact.companyId || "",
    });
    setIsModalOpen(true);
  };

  const filteredContacts = contacts.filter((c) => 
    (c.firstName + " " + c.lastName).toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 text-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                 Identity Observer Active
              </span>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">Contact Intelligence Orchestration</h1>
           <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage human identity artifacts, account blocks & engagement history</p>
        </div>
        <button onClick={openCreate} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Provision Identity Node
        </button>
      </div>

      <div className="flex items-center gap-4">
         <div className="w-full md:max-w-md p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 group focus-within:border-indigo-500/30 transition-all shadow-inner">
            <Search className="w-5 h-5 text-gray-500 group-focus-within:text-indigo-400" />
            <input 
               type="text" 
               placeholder="Search identity artifact or vector email..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredContacts.map((contact) => {
             const thisCompany = companies.find((c) => c.id === contact.companyId) || contact.company;
             return (
             <div key={contact.id} className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-colors pointer-events-none" />
                
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-[20px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-2xl text-xl font-black uppercase">
                         {contact.firstName[0]}
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => openEdit(contact)} className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(contact.id)} className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight mb-2 leading-none">{contact.firstName} {contact.lastName}</h3>
                   <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 mb-6">
                     Node Active
                   </span>

                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                         <Mail className="w-4 h-4 opacity-40 shrink-0" /> {contact.email}
                      </div>
                      {contact.phone && (
                         <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            <Phone className="w-4 h-4 opacity-40 shrink-0" /> {contact.phone}
                         </div>
                      )}
                      {thisCompany && (
                         <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            <Building2 className="w-4 h-4 opacity-40 shrink-0" /> {thisCompany.name}
                         </div>
                      )}
                   </div>
                </div>
             </div>
           )})}
           {filteredContacts.length === 0 && (
             <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
                 <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No identity artifacts found.</p>
             </div>
           )}
        </div>
      )}

      {/* Identity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl p-8 rounded-[40px] bg-[#0b0f19] border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <User className="w-6 h-6 text-indigo-500" /> {editingId ? "Reconfigure Identity" : "Generate Identity"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Given Designation</label>
                   <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Surname Designation</label>
                   <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40" />
                 </div>
                 <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Network Vector (Email)</label>
                   <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comm Channel</label>
                   <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 tracking-widest" />
                 </div>
                 <div className="col-span-1 space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bind to Lattice (Company)</label>
                   <select value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/40 appearance-none cursor-pointer">
                      <option value="" className="bg-[#0b0f19]">Standalone Node</option>
                      {companies.map(c => (
                         <option key={c.id} value={c.id} className="bg-[#0b0f19]">{c.name}</option>
                      ))}
                   </select>
                 </div>
              </div>
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white/[0.02] border-white/5 border hover:bg-white/[0.05] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">Execute Injection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
