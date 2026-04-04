"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Save, Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";
import Link from "next/link";

export default function InviteUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    roles: ["USER"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/invite", formData);
      toast.success("Identity vector dispatched successfully");
      router.push("/settings/users");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to dispatch identity vector");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl pb-20">
      <Link 
        href="/settings/users" 
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Identity Matrix
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Provision Identity Node</h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Deploy an invitation vector to a new subordinate</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Identity Parameters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Given Identity</label>
            <input 
              type="text" 
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Surname Identity</label>
            <input 
              type="text" 
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Destination Vector (Email)
            </label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Privilege Matrix</label>
            <select
              value={formData.roles[0]}
              onChange={(e) => setFormData({...formData, roles: [e.target.value]})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all appearance-none cursor-pointer"
            >
              <option value="USER" className="bg-[#0b0f19]">Standard Operations Node</option>
              <option value="TENANT_ADMIN" className="bg-[#0b0f19]">Tenant Administrative Layer</option>
              <option value="MANAGER" className="bg-[#0b0f19]">Group Manager Array</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Execute Provisioning Dispatch
          </button>
        </div>
      </form>
    </div>
  );
}
