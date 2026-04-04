"use client";

import { useState, useEffect } from "react";
import { User, Mail, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import api from "@/lib/api/client";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await api.patch(`/users/${user.id}`, formData);
      toast.success("Profile updated successfully");
      
      // Update local context
      const updatedRes = await api.get("/users/me");
      if (updatedRes.data?.data) {
        // Force session refresh
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Profile Configuration</h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage your identity and artifact preferences</p>
      </div>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl font-black text-indigo-400 uppercase shadow-xl">
          {formData.firstName?.[0] || 'U'}
        </div>
        <div className="text-center md:text-left">
          <p className="text-2xl font-black text-white uppercase tracking-tighter">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-[11px] text-gray-500 font-black uppercase tracking-widest mt-1">
            {formData.email} • {user.roles?.join(', ')}
          </p>
          <div className="flex gap-4 mt-6 justify-center md:justify-start">
            <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
              Upload Identity Token
            </button>
            <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white/[0.03] text-gray-500 border border-white/10 rounded-xl hover:text-red-400 transition-all">
              Flush Artifact
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Core Matrices</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Given Identity</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Surname Identity</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Primary Vector
            </label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Communications Node (Phone)</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all" 
            />
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Commit Identity Modifications
          </button>
        </div>
      </form>
    </div>
  );
}
