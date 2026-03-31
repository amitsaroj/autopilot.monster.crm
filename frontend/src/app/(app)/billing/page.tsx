"use client";

import { CreditCard, Zap, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Download, Receipt, Users } from 'lucide-react';
import Link from 'next/link';

export default function BillingOverviewPage() {
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
              <Zap className="w-3.5 h-3.5" /> Enterprise OS
            </span>
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Active</span>
          </div>
          <h2 className="text-3xl font-black text-foreground">$2,499.00 <span className="text-lg font-medium text-muted-foreground">/ month</span></h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your workspace is currently on the Enterprise Plan. This plan includes unlimited team members, advanced AI Voice campaigns, and custom SLA support.
          </p>
          <div className="pt-4 flex gap-3">
            <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors">
              Upgrade to Unlimited
            </button>
            <button className="px-5 py-2.5 bg-background border border-input hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors">
              Change Plan
            </button>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-80 bg-muted/40 rounded-xl p-5 border border-border">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Next Invoice</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-foreground">$2,499.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-semibold text-foreground">Oct 12, 2024</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-3 border-t border-border">
              <span className="flex items-center gap-2 text-muted-foreground"><CreditCard className="w-4 h-4"/> Visa ending in 4242</span>
              <Link href="/billing/payment-methods" className="text-primary hover:underline font-medium text-xs">Update</Link>
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
              <span className="text-xs font-medium text-muted-foreground">84%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }} />
            </div>
            <p className="text-xs text-muted-foreground">12,489 of 15,000 limit</p>
          </div>

          {/* AI Voice Minutes */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> AI Voice Minutes</span>
              <span className="text-xs font-medium text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> 96%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '96%' }} />
            </div>
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>9,620 of 10,000 limits</span>
              <button className="text-primary hover:underline font-bold">Buy Add-on</button>
            </p>
          </div>

          {/* Storage */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Download className="w-4 h-4 text-green-500"/> File Storage (RAG)</span>
              <span className="text-xs font-medium text-muted-foreground">12%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '12%' }} />
            </div>
            <p className="text-xs text-muted-foreground">12 GB of 100 GB limit</p>
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

        <Link href="/billing/payment-methods" className="group bg-card hover:bg-muted/50 border border-border rounded-xl p-5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors"><CreditCard className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-foreground">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">Update your credit cards and billing address.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

    </div>
  );
}
