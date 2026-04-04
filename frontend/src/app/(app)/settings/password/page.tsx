"use client";

import { useState } from "react";
import { Lock, Save, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api/client";

export default function SecurityPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New vault phrases do not match");
    }
    
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Security Vault phrase rotated successfully");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to rotate Security Vault phrase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Vault Security Rotation</h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage infrastructure access keys and authentication primitives</p>
      </div>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl font-black text-emerald-400 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-2xl font-black text-white uppercase tracking-tighter">
            Zero Trust Enabled
          </p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2 max-w-lg">
            Your identity artifacts are protected by AES-256 encryption. We recommend rotating your Vault keys every 90 days to maintain maximum tenant compliance.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Phrase Rotation</h2>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Current Identity Phrase</label>
            <input 
              type="password" 
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-mono placeholder:font-sans tracking-widest" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">New Identity Phrase</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-mono placeholder:font-sans tracking-widest" 
            />
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">Require: 8+ Chars, 1 Target Int, 1 Special Glyph</p>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Confirm Identity Phrase</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-mono placeholder:font-sans tracking-widest" 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Compile Rotation Schema
          </button>
        </div>
      </form>
    </div>
  );
}
