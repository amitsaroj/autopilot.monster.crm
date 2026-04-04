"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Building2, User, Globe, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workspaceName: "",
    subdomain: "",
    industry: "",
    roleTitle: "",
  });

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.patch("/settings/workspace", {
        name: formData.workspaceName,
        subdomain: formData.subdomain,
      });

      toast.success("Workspace initialized successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to initialize workspace.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-white overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 mb-4 shadow-2xl shadow-indigo-500/20">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
            Initialize Parameters
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto font-medium leading-relaxed">
            Configure your workspace identity artifacts and administrative footprint to launch the CRM infrastructure.
          </p>
        </div>

        <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleComplete} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Workspace Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={formData.workspaceName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ 
                      ...formData, 
                      workspaceName: name,
                      subdomain: name.toLowerCase().replace(/[^a-z0-9]/g, "") 
                    });
                  }}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Network Subdomain
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 pl-[80px] text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all font-mono"
                  />
                  <span className="absolute left-5 text-gray-500 font-mono text-sm">https://</span>
                  <span className="absolute right-5 text-gray-600 font-mono text-sm leading-none pt-1">.autopilot.crm</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Identity Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="Founder, CEO"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Industry Sector
                </label>
                <select
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0b0f19]">Select vector...</option>
                  <option value="SaaS" className="bg-[#0b0f19]">Software & SaaS</option>
                  <option value="E-commerce" className="bg-[#0b0f19]">E-commerce</option>
                  <option value="Agency" className="bg-[#0b0f19]">Digital Agency</option>
                  <option value="Enterprise" className="bg-[#0b0f19]">Enterprise Services</option>
                  <option value="Other" className="bg-[#0b0f19]">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Initialize Infrastructure <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
              Secured by End-to-End Encryption • Role-Based Zero Trust Architecture
           </p>
        </div>
      </div>
    </div>
  );
}
