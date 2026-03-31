"use client";

import { CreditCard, Plus, CheckCircle2, MoreVertical, Building } from 'lucide-react';
import Link from 'next/link';

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/billing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Payment Methods</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your credit cards and billing information.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Saved Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Saved Cards</h2>
          
          {/* Card 1 (Default) */}
          <div className="bg-card border border-[hsl(246,80%,60%)] rounded-xl p-5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(246,80%,60%)]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0">
                  <span className="font-black text-slate-800 italic tracking-tighter">VISA</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Visa ending in 4242</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">Default</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">Expires 12/26</p>
                </div>
              </div>
              <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Your active subscription is billed to this card.
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0">
                  <span className="font-bold text-slate-800 tracking-tighter">Mastercard</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Mastercard ending in 8812</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Expires 08/25</p>
                </div>
              </div>
              <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <button className="text-sm font-medium text-primary hover:underline">Make Default</button>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Billing Information</h2>
            <button className="text-primary hover:underline font-medium text-sm">Edit</button>
          </div>
          
          <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Building className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">AutopilotMonster Enterprise</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Attn: Amit Saroj<br />
                  123 Innovation Drive<br />
                  Suite 400<br />
                  San Francisco, CA 94105<br />
                  United States
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-1">Tax ID / VAT Number</p>
              <p className="text-sm text-muted-foreground font-mono bg-background border border-input rounded px-2 py-1 inline-block">US-123456789</p>
              <p className="text-xs text-muted-foreground mt-2">This will appear on all your invoices.</p>
            </div>
          </div>
        </div>
        
      </div>

    </div>
  );
}
