"use client";

import { useState } from "react";
import { Plus, Trash2, Mail, Users, UserPlus, Shield, ChevronRight, Rocket, Loader2, Info, Layout, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingInvitePage() {
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState([{ email: "", role: "ADMIN" }]);

  const addInvite = () => {
    setInvites([...invites, { email: "", role: "USER" }]);
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Engagement invitations dispatched");
    setLoading(false);
    // Redirect to next onboarding stage
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center p-6 text-sans">
      <div className="max-w-2xl w-full p-12 rounded-[50px] bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 space-y-10">
           <div className="flex justify-between items-center mb-12">
              <div className="w-16 h-16 rounded-[24px] bg-emerald-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40">
                 <UserPlus className="w-8 h-8" />
              </div>
              <div className="flex gap-2">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-500 border border-white/10", i === 2 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : i < 2 ? "bg-emerald-500/40" : "bg-white/5")} />
                 ))}
              </div>
           </div>

           <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 leading-none">Assemble Operatives</h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Onboarding Phase 02: Team Lattice Initialization</p>
           </div>

           <div className="space-y-6 max-h-[400px] pr-2 overflow-y-auto scrollbar-none">
              {invites.map((invite, idx) => (
                <div key={idx} className="flex gap-4 items-start animate-in slide-in-from-left-4 duration-500 group">
                   <div className="flex-1 space-y-2">
                      <div className="relative">
                         <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                         <input 
                           type="email" 
                           value={invite.email}
                           onChange={(e) => {
                              const newInvites = [...invites];
                              newInvites[idx].email = e.target.value;
                              setInvites(newInvites);
                           }}
                           className="w-full bg-white/[0.03] border border-white/5 rounded-3xl pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-emerald-500/40 shadow-inner" 
                           placeholder="operative@organization.com" 
                         />
                      </div>
                   </div>
                   <div className="w-32">
                      <select 
                        value={invite.role}
                        onChange={(e) => {
                           const newInvites = [...invites];
                           newInvites[idx].role = e.target.value;
                           setInvites(newInvites);
                        }}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-6 py-5 text-[10px] font-black text-emerald-400 uppercase tracking-widest outline-none appearance-none cursor-pointer"
                      >
                         <option value="USER" className="bg-[#0b0f19]">User</option>
                         <option value="ADMIN" className="bg-[#0b0f19]">Admin</option>
                      </select>
                   </div>
                   <button 
                     onClick={() => removeInvite(idx)} 
                     className="p-5 rounded-3xl bg-white/5 border border-white/10 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              ))}
           </div>

           <button 
              onClick={addInvite} 
              className="w-full py-5 rounded-[32px] border-2 border-dashed border-white/10 text-gray-500 hover:border-emerald-500/30 hover:text-emerald-400 flex items-center justify-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest shadow-inner group"
           >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Another Operative
           </button>

           <div className="pt-10 flex gap-4">
              <button onClick={() => window.history.back()} className="px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Skip for Now</button>
              <button 
                onClick={handleComplete} 
                disabled={loading}
                className="flex-1 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 group transition-all"
              >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin font-black text-xl" /> : (
                   <>
                     Dispatch Protocol
                     <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
