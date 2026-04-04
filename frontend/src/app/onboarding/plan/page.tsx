"use client";

import { useState } from "react";
import { Check, Rocket, Zap, Shield, ChevronRight, Loader2, Star, BadgeCheck, Globe, Users, Database } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OnboardingPlanPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const plans = [
    { 
      id: "starter", 
      name: "Starter Vector", 
      price: "0", 
      icon: Rocket, 
      color: "text-blue-400",
      features: ["Up to 1,000 Contacts", "10 AI Credits/Mo", "Basic CRM Suite", "Standard Support"]
    },
    { 
      id: "pro", 
      name: "Professional Core", 
      price: "199", 
      icon: Zap, 
      color: "text-emerald-400",
      recommended: true,
      features: ["Up to 10,000 Contacts", "500 AI Credits/Mo", "Advanced Workflows", "Priority Support", "WhatsApp Beta"]
    },
    { 
      id: "enterprise", 
      name: "Enterprise Grid", 
      price: "499", 
      icon: Shield, 
      color: "text-violet-400",
      features: ["Unlimited Contacts", "Unlimited AI Orchestration", "White-Labeling", "Dedicated Engineer", "Custom SLA"]
    }
  ];

  const handleComplete = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Subscription vector materialized");
    setLoading(false);
    // Redirect to final dashboard
  };

  return (
    <div className="min-h-screen bg-[#06080f] flex items-center justify-center p-6 text-sans">
      <div className="max-w-6xl w-full p-12 rounded-[50px] bg-white/[0.02] border border-white/[0.05] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 space-y-10">
           <div className="flex justify-between items-center mb-12">
              <div className="w-16 h-16 rounded-[24px] bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-500/40">
                 <Star className="w-8 h-8" />
              </div>
              <div className="flex gap-2">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-500 border border-white/10", i === 3 ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "bg-violet-500/40")} />
                 ))}
              </div>
           </div>

           <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 leading-none">Select Growth Vector</h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Onboarding Phase 03: Fiscal Layer Provisioning</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "p-8 rounded-[40px] border-2 transition-all cursor-pointer relative overflow-hidden group",
                    selectedPlan === plan.id 
                      ? "bg-violet-500/5 border-violet-500 shadow-2xl shadow-violet-500/20" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  )}
                >
                   {plan.recommended && (
                     <div className="absolute top-6 right-6 px-3 py-1 bg-violet-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">Recommended</div>
                   )}

                   <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-10 transition-all", selectedPlan === plan.id ? "bg-violet-500 text-white" : plan.color)}>
                      <plan.icon className="w-6 h-6" />
                   </div>

                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-violet-400 transition-colors">{plan.name}</h3>
                   <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black text-white tracking-tighter">${plan.price}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">/ Mo</span>
                   </div>

                   <ul className="space-y-4 mb-10">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                           <Check className={cn("w-4 h-4", selectedPlan === plan.id ? "text-violet-400" : "text-gray-600")} /> {f}
                        </li>
                      ))}
                   </ul>

                   <div className={cn(
                     "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center",
                     selectedPlan === plan.id ? "bg-violet-500 text-white shadow-xl" : "bg-white/5 text-gray-500 group-hover:text-gray-300"
                   )}>
                      {selectedPlan === plan.id ? "Strategy Locked" : "Select Tier"}
                   </div>
                </div>
              ))}
           </div>

           <div className="pt-10 flex gap-4">
              <button 
                onClick={handleComplete} 
                disabled={loading}
                className="w-full px-10 py-5 bg-violet-600 hover:bg-violet-500 text-white rounded-[32px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-violet-600/30 flex items-center justify-center gap-3 group transition-all"
              >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin font-black text-xl" /> : (
                   <>
                     Execute Launch Sequence
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
