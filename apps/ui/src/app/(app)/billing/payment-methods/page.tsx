import { CreditCard, Plus, Trash2, Check, Shield, Star } from 'lucide-react';

const cards = [
  { brand: 'Visa', last4: '4242', exp: '08/27', default: true },
  { brand: 'Mastercard', last4: '5555', exp: '12/25', default: false },
];

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Methods</h1>
          <p className="page-description">Manage cards and billing methods</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Plus className="h-4 w-4" />Add Card</button>
      </div>

      <div className="space-y-3">
        {cards.map((c) => (
          <div key={c.last4} className={`rounded-xl border bg-card p-5 flex items-center gap-4 ${c.default ? 'border-[hsl(246,80%,60%)]' : 'border-border'}`}>
            <div className="w-14 h-9 rounded-lg bg-muted flex items-center justify-center font-bold text-sm text-foreground">{c.brand === 'Visa' ? '💳' : '💳'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{c.brand} ending in {c.last4}</p>
                {c.default && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] text-xs rounded-full"><Star className="h-2.5 w-2.5" />Default</span>}
              </div>
              <p className="text-xs text-muted-foreground">Expires {c.exp}</p>
            </div>
            <div className="flex gap-2">
              {!c.default && <button className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors">Set Default</button>}
              <button className="p-2 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500/30 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new card */}
      <div className="rounded-xl border border-dashed border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-[hsl(246,80%,60%)]" />Add New Card</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Card Number</label>
            <input placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Expiry (MM/YY)</label>
            <input placeholder="08/27" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">CVV</label>
            <input placeholder="•••" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Name on Card</label>
            <input placeholder="Amit Saroj" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5 text-green-500" />Your card details are encrypted with TLS and processed by Stripe.</div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Check className="h-4 w-4" />Save Card</button>
      </div>
    </div>
  );
}
