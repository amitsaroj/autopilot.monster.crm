'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import { productService, BillingType } from '@/services/product.service';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    currency: 'USD',
    billingType: BillingType.ONE_TIME,
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await productService.createProduct({
        ...form,
        price: parseFloat(form.price) || 0,
        status: 'ACTIVE',
      });
      toast.success('Product created');
      const id = (res as { data: { data: { id: string } } }).data.data.id;
      router.push(id ? `/crm/products/${id}` : '/crm/products');
    } catch {
      toast.error('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Link href="/crm/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Products
      </Link>
      <h1 className="text-2xl font-bold">New Product</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium">Name *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="text-sm font-medium">SKU</label>
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Price *</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium">Billing type</label>
            <select value={form.billingType} onChange={(e) => setForm({ ...form, billingType: e.target.value as BillingType })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm">
              {Object.values(BillingType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create Product
        </button>
      </form>
    </div>
  );
}
