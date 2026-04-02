"use client";

import { useState, useEffect } from "react";
import { CreditCard, Zap, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Download, Receipt, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Subscription {
  planId: string;
  status: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  billingCycle: string;
}

interface Usage {
  [key: string]: number;
}

export default function BillingOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, usageRes] = await Promise.all([
          fetch('/api/v1/monetization/subscription').then(res => res.ok ? res.json() : null),
          fetch('/api/v1/monetization/usage/all').then(res => res.ok ? res.json() : {})
        ]);
        setSub(subRes);
        setUsage(usageRes);
      } catch (err) {
        console.error('Failed to fetch billing data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpgrade = async (planId: string, billingCycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') => {
    setActionLoading('upgrade');
    try {
      const res = await fetch('/api/v1/monetization/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to initiate checkout session');
      }
    } catch (err) {
      toast.error('Error initiating checkout');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading('portal');
    try {
      const res = await fetch('/api/v1/monetization/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to initiate portal session');
      }
    } catch (err) {
      toast.error('Error initiating portal');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your enterprise plan, limits, and payment methods.</p>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row gap-8 justify-between relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> {sub?.planId || 'Free Plan'}
            </span>
            <span className={`text-xs font-semibold flex items-center gap-1 ${sub?.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'}`}>
              <CheckCircle2 className="w-3.5 h-3.5"/> {sub?.status || 'Inactive'}
            </span>
          </div>
          <h2 className="text-3xl font-black text-foreground">
             {sub?.billingCycle === 'ANNUAL' ? 'Custom Annual' : 'Custom Monthly'}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your workspace is currently on the {sub?.planId} Plan. This plan includes unlimited team members, advanced AI Voice campaigns, and custom SLA support.
          </p>
          <div className="pt-4 flex gap-3">
            <button 
              onClick={() => handleUpgrade('pro-plan', 'ANNUAL')}
              disabled={!!actionLoading}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {actionLoading === 'upgrade' && <Loader2 className="w-4 h-4 animate-spin" />}
              Upgrade Plan
            </button>
            <button 
                onClick={handlePortal}
                disabled={!!actionLoading}
                className="px-5 py-2.5 bg-background border border-input hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {actionLoading === 'portal' && <Loader2 className="w-4 h-4 animate-spin" />}
              Manage Subscription
            </button>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-80 bg-muted/40 rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Next Invoice</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold text-foreground">Upcoming</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Renewal Date</span>
              <span className="font-semibold text-foreground">
                {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-3 border-t border-border">
              <span className="flex items-center gap-2 text-muted-foreground"><CreditCard className="w-4 h-4"/> Managed in Stripe</span>
              <button onClick={handlePortal} className="text-primary hover:underline font-medium text-xs">Update</button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" /> Resource Usage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Contacts Usage */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-blue-500"/> CRM Contacts</span>
              <span className="text-xs font-medium text-muted-foreground">{(usage['contacts'] || 0)} Units</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-muted-foreground">Metered real-time usage (per tenant)</p>
          </div>

          {/* AI Voice Minutes */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> AI Task Units</span>
              <span className="text-xs font-medium text-muted-foreground">{(usage['tasks'] || 0)} Units</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Automatic usage tracking active</span>
            </p>
          </div>

          {/* Storage */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Download className="w-4 h-4 text-green-500"/> Data Storage</span>
              <span className="text-xs font-medium text-muted-foreground">{(usage['storage'] || 0)} MB</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '22%' }} />
            </div>
            <p className="text-xs text-muted-foreground">Verified for RAG and Media</p>
          </div>

        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/billing/invoices" className="group bg-card hover:bg-muted/50 border border-border rounded-xl p-5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors"><Receipt className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-foreground">Invoice History</h3>
              <p className="text-sm text-muted-foreground">View past payments and download PDF receipts.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <button onClick={handlePortal} className="group w-full text-left bg-card hover:bg-muted/50 border border-border rounded-xl p-5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors"><CreditCard className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-foreground">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">Update your credit cards and billing address.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

    </div>
  );
}
