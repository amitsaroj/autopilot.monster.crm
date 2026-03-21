import { Package, Plus, Search, Filter, Download, Upload, Tag, MoreHorizontal, DollarSign, Archive, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const products = [
  { id: 1, name: 'CRM Enterprise', sku: 'CRM-ENT-001', category: 'License', price: '$4,800/yr', cost: '$800', margin: '83%', stock: '∞', status: 'Active' },
  { id: 2, name: 'CRM Professional', sku: 'CRM-PRO-001', category: 'License', price: '$1,200/yr', cost: '$200', margin: '83%', stock: '∞', status: 'Active' },
  { id: 3, name: 'Implementation Pack', sku: 'SVC-IMPL-001', category: 'Service', price: '$5,000', cost: '$2,000', margin: '60%', stock: '∞', status: 'Active' },
  { id: 4, name: 'Priority Support', sku: 'SVC-SUP-001', category: 'Service', price: '$999/yr', cost: '$150', margin: '85%', stock: '∞', status: 'Active' },
  { id: 5, name: 'API Access Add-on', sku: 'ADD-API-001', category: 'Add-on', price: '$299/mo', cost: '$40', margin: '87%', stock: '∞', status: 'Active' },
  { id: 6, name: 'Legacy Basic Plan', sku: 'CRM-BSC-001', category: 'License', price: '$599/yr', cost: '$100', margin: '83%', stock: '∞', status: 'Archived' },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products & Services</h1>
          <p className="page-description">Product catalog · 6 items</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Upload className="h-4 w-4" />Import</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Download className="h-4 w-4" />Export</button>
          <Link href="/crm/products/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '6', icon: Package, color: 'text-blue-400' },
          { label: 'Active', value: '5', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Avg Price', value: '$2.1k', icon: DollarSign, color: 'text-yellow-400' },
          { label: 'Avg Margin', value: '82%', icon: Archive, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search products..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
        <div className="ml-auto flex gap-2">
          {['All', 'License', 'Service', 'Add-on'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground"><input type="checkbox" /></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cost</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Margin</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(246,80%,60%)]/10 flex items-center justify-center"><Package className="h-4 w-4 text-[hsl(246,80%,60%)]" /></div>
                    <Link href={`/crm/products/${p.id}`} className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]">{p.name}</Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.sku}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-muted rounded-full text-xs">{p.category}</span></td>
                <td className="px-4 py-3 font-semibold text-foreground">{p.price}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.cost}</td>
                <td className="px-4 py-3 text-green-500 font-medium">{p.margin}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/crm/products/${p.id}/edit`} className="p-1 rounded hover:bg-muted transition-colors inline-flex"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
